import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  username: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, userId }: VerificationEmailRequest = await req.json();

    console.log("Sending verification email to:", email, "for user:", username);

    // Create a verification token (you could also use JWT for more security)
    const verificationToken = crypto.randomUUID();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Store verification token in database (you might want to create a table for this)
    const { error: tokenError } = await supabase
      .from('profiles')
      .update({ 
        verification_token: verificationToken,
        email_verified: false 
      })
      .eq('id', userId);

    if (tokenError) {
      console.error("Error storing verification token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create verification link
    const verificationLink = `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-email?token=${verificationToken}&userId=${userId}`;

    const emailResponse = await resend.emails.send({
      from: "HACKLINK <noreply@hacklink.com>",
      to: [email],
      subject: "Verify Your HACKLINK Account",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin-bottom: 10px;">Welcome to HACKLINK, ${username}!</h1>
            <p style="color: #6B7280; font-size: 16px;">Please verify your email address to complete your registration.</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <h2 style="color: white; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: white; margin-bottom: 25px;">Click the button below to verify your email address and activate your account.</p>
            <a href="${verificationLink}" 
               style="display: inline-block; background: white; color: #3B82F6; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px;">
              Verify Email Address
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6B7280; font-size: 14px;">
              If you didn't create an account with HACKLINK, you can safely ignore this email.
            </p>
            <p style="color: #6B7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationLink}" style="color: #3B82F6; word-break: break-all;">${verificationLink}</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verification email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);