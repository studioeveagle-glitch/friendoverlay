#!/bin/bash

# ============================================
# FriendOverlay - Automated Supabase Setup
# macOS / Linux
# ============================================

set -e  # Exit on error

echo "============================================"
echo "🚀 FriendOverlay - Supabase Auto-Setup"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: Check if Supabase CLI is installed
# ============================================
echo -e "${BLUE}[1/7]${NC} Checking Supabase CLI..."

if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓${NC} Supabase CLI already installed"
    supabase --version
else
    echo -e "${YELLOW}!${NC} Supabase CLI not found. Installing..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo -e "${RED}✗${NC} Homebrew not found. Please install it first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt &> /dev/null; then
            # Debian/Ubuntu
            curl -fsSL https://packagecloud.io/supabase/supabase/gpgkey | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/supabase.gpg
            echo "deb https://packagecloud.io/supabase/supabase/any/ any main" | sudo tee /etc/apt/sources.list.d/supabase.list
            sudo apt update
            sudo apt install -y supabase
        elif command -v dnf &> /dev/null; then
            # Fedora/RHEL
            curl -fsSL https://packagecloud.io/supabase/supabase/gpgkey | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/supabase.gpg
            echo "[supabase]
name=Supabase
baseurl=https://packagecloud.io/supabase/supabase/el/8/\$basearch
enabled=1
gpgcheck=0
gpgkey=https://packagecloud.io/supabase/supabase/gpgkey" | sudo tee /etc/yum.repos.d/supabase.repo
            dnf install -y supabase
        else
            echo -e "${RED}✗${NC} Unsupported Linux distribution. Installing via npm..."
            npm install -g supabase
        fi
    else
        echo -e "${RED}✗${NC} Unsupported OS. Installing via npm..."
        npm install -g supabase
    fi
    
    echo -e "${GREEN}✓${NC} Supabase CLI installed"
fi

# ============================================
# STEP 2: Login to Supabase
# ============================================
echo ""
echo -e "${BLUE}[2/7]${NC} Logging in to Supabase..."
echo -e "${YELLOW}!${NC} This will open your browser. Please login."

supabase login

echo -e "${GREEN}✓${NC} Logged in successfully"

# ============================================
# STEP 3: Create Project
# ============================================
echo ""
echo -e "${BLUE}[3/7]${NC} Creating Supabase project..."

PROJECT_NAME="FriendOverlay"
echo "Project name: $PROJECT_NAME"

# Check if project already exists
EXISTING_PROJECT=$(supabase projects list --output json | grep -i "$PROJECT_NAME" | head -1)

if [ -n "$EXISTING_PROJECT" ]; then
    echo -e "${YELLOW}!${NC} Project '$PROJECT_NAME' already exists. Using existing project..."
    PROJECT_ID=$(echo "$EXISTING_PROJECT" | awk '{print $1}')
else
    echo "Creating new project..."
    supabase projects create --name "$PROJECT_NAME" --output json > /tmp/project_create.json 2>/dev/null || true
    
    # Extract project ID
    if [ -f /tmp/project_create.json ]; then
        PROJECT_ID=$(cat /tmp/project_create.json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${YELLOW}!${NC} Please select your project from the list:"
        supabase projects list
        read -p "Enter Project ID: " PROJECT_ID
    fi
fi

echo -e "${GREEN}✓${NC} Project ID: $PROJECT_ID"

# Link project
supabase link --project-ref "$PROJECT_ID"
echo -e "${GREEN}✓${NC} Project linked"

# ============================================
# STEP 4: Upload Schema
# ============================================
echo ""
echo -e "${BLUE}[4/7]${NC} Uploading database schema..."

SCHEMA_FILE="supabase/schema_v3_simple_auth.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}✗${NC} Schema file not found: $SCHEMA_FILE"
    echo "Please make sure you're running this from the FriendOverlay directory"
    exit 1
fi

echo "Uploading $SCHEMA_FILE..."
supabase db execute --file "$SCHEMA_FILE"

echo -e "${GREEN}✓${NC} Schema uploaded successfully"

# ============================================
# STEP 5: Enable Realtime
# ============================================
echo ""
echo -e "${BLUE}[5/7]${NC} Enabling Realtime for tables..."

TABLES=("messages" "conversations" "user_presence" "call_sessions" "drawings")

for TABLE in "${TABLES[@]}"; do
    echo "  Enabling realtime for: $TABLE"
    supabase realtime enable --table "$TABLE" 2>/dev/null || echo "  (Table $TABLE may not exist yet)"
done

echo -e "${GREEN}✓${NC} Realtime enabled"

# ============================================
# STEP 6: Get API Credentials
# ============================================
echo ""
echo -e "${BLUE}[6/7]${NC} Getting API credentials..."

supabase projects api-keys list --output json > /tmp/api_keys.json 2>/dev/null || true

if [ -f /tmp/api_keys.json ]; then
    ANON_KEY=$(cat /tmp/api_keys.json | grep -o '"anon_key":"[^"]*"' | head -1 | cut -d'"' -f4)
    SERVICE_KEY=$(cat /tmp/api_keys.json | grep -o '"service_role_key":"[^"]*"' | head -1 | cut -d'"' -f4)
    PROJECT_URL="https://${PROJECT_ID}.supabase.co"
    
    echo -e "${GREEN}✓${NC} Credentials retrieved"
else
    echo -e "${YELLOW}!${NC} Please copy your credentials from Supabase Dashboard:"
    echo "   Settings → API → anon public key"
    read -p "Enter anon key: " ANON_KEY
    PROJECT_URL="https://${PROJECT_ID}.supabase.co"
fi

# ============================================
# STEP 7: Update App Configuration
# ============================================
echo ""
echo -e "${BLUE}[7/7]${NC} Updating app configuration..."

APP_CONFIG_FILE="app/supabase.js"

if [ ! -f "$APP_CONFIG_FILE" ]; then
    echo -e "${RED}✗${NC} App config file not found: $APP_CONFIG_FILE"
    exit 1
fi

# Create backup
cp "$APP_CONFIG_FILE" "${APP_CONFIG_FILE}.backup"

# Replace credentials
sed -i.bak "s|YOUR_PROJECT_URL|${PROJECT_URL}|g" "$APP_CONFIG_FILE"
sed -i.bak "s|YOUR_ANON_KEY|${ANON_KEY}|g" "$APP_CONFIG_FILE"

# Clean up backup files
rm -f "${APP_CONFIG_FILE}.bak"

echo -e "${GREEN}✓${NC} App configuration updated"

# ============================================
# SETUP COMPLETE
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo "============================================"
echo ""
echo "📊 Project Details:"
echo "   Project ID: $PROJECT_ID"
echo "   Project URL: $PROJECT_URL"
echo ""
echo "📱 Next Steps:"
echo "   1. Install dependencies: npm install"
echo "   2. Run app: npx react-native run-android"
echo "   3. Test signup/login!"
echo ""
echo "🔐 Save these credentials securely:"
echo "   Project URL: $PROJECT_URL"
echo "   Anon Key: ${ANON_KEY:0:20}..."
echo ""
echo "📄 Configuration saved to: $APP_CONFIG_FILE"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

# Cleanup temp files
rm -f /tmp/project_create.json /tmp/api_keys.json
