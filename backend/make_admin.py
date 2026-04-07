import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Missing Supabase credentials in .env file.")
    sys.exit(1)

supabase: Client = create_client(url, key)

if len(sys.argv) < 2:
    print("Usage: python make_admin.py <email>")
    sys.exit(1)

email_to_upgrade = sys.argv[1]

# 1. Update the profile
response = supabase.table("profiles").update({"role": "admin"}).eq("email", email_to_upgrade).execute()

if len(response.data) > 0:
    print(f"✅ Success! Upgrade complete. {email_to_upgrade} is now an admin.")
else:
    print(f"❌ Could not find a profile with email {email_to_upgrade}. Have they signed up in the app yet?")
