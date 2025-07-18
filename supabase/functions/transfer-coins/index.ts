import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  emailOrUsername: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the current user from the auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header found');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (adminError || adminProfile?.username !== 'admin') {
      throw new Error('Only admin can transfer coins');
    }

    const { emailOrUsername, amount }: TransferRequest = await req.json();

    if (!emailOrUsername || !amount || amount <= 0) {
      throw new Error('Invalid transfer details');
    }

    console.log(`Admin transferring ${amount} coins to ${emailOrUsername}`);

    // Find the target user by email or username
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, username, coins')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .single();

    if (userError || !targetUser) {
      throw new Error('User not found');
    }

    // Update the target user's coins
    const newCoins = targetUser.coins + amount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: newCoins })
      .eq('id', targetUser.id);

    if (updateError) {
      throw new Error('Failed to update user coins');
    }

    console.log(`Successfully transferred ${amount} coins to ${targetUser.username} (${targetUser.email})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully transferred ${amount} coins to ${targetUser.username}`,
        user: {
          id: targetUser.id,
          username: targetUser.username,
          email: targetUser.email,
          newBalance: newCoins
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Transfer coins error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
};

serve(handler);