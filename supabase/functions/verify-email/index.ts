import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('userId');

    if (!token || !userId) {
      return new Response(
        `
        <html>
          <head>
            <title>Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Failed</h1>
            <p>Invalid verification link. Please try again or contact support.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify token and get user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('verification_token', token)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Error verifying token:", profileError);
      return new Response(
        `
        <html>
          <head>
            <title>Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Failed</h1>
            <p>Invalid or expired verification token. Please try again or contact support.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Check if already verified
    if (profile.email_verified) {
      return new Response(
        `
        <html>
          <head>
            <title>Already Verified</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .success { color: #16a34a; }
              .button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1 class="success">Email Already Verified</h1>
            <p>Your email address has already been verified. You can now log in to your account.</p>
            <a href="${Deno.env.get("SUPABASE_URL")}/login" class="button">Go to Login</a>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Update profile to mark as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        email_verified: true,
        verification_token: null // Clear the token
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        `
        <html>
          <head>
            <title>Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Failed</h1>
            <p>There was an error verifying your email. Please try again or contact support.</p>
          </body>
        </html>
        `,
        {
          status: 500,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    console.log("Email verified successfully for user:", userId);

    // Return success page
    return new Response(
      `
      <html>
        <head>
          <title>Email Verified Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #16a34a; }
            .button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            .gradient-bg { background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; border-radius: 12px; margin: 30px 0; }
            .gradient-bg h1 { color: white; margin-bottom: 15px; }
            .gradient-bg p { color: white; }
          </style>
        </head>
        <body>
          <div class="gradient-bg">
            <h1>✅ Email Verified Successfully!</h1>
            <p>Welcome to HACKLINK, ${profile.username}! Your email has been verified and your account is now active.</p>
          </div>
          
          <p>You can now log in to your account and start using HACKLINK.</p>
          
          <a href="${Deno.env.get("SUPABASE_URL")}/login" class="button">Go to Login</a>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in verify-email function:", error);
    return new Response(
      `
      <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Verification Error</h1>
          <p>There was an unexpected error processing your verification. Please try again or contact support.</p>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

serve(handler);