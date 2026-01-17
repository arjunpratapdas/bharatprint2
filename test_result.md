#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  BharatPrint - Secure, QR-based document sharing platform for Indian print shops.
  Key features: OTP auth (Twilio mocked), file upload with auto-delete, customer upload portal,
  7-day free trial, PostgreSQL/Supabase backend (currently using mock DB with placeholders).
  User requested: Remove WhatsApp references, remove referral system, add dark mode,
  customer upload portal with 5/10/15 min self-destruct timers.

backend:
  - task: "OTP Authentication (Send OTP)"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tested via curl - OTP sent successfully with mock Twilio"
      - working: true
        agent: "testing"
        comment: "✅ TESTED: POST /api/auth/send-otp works correctly. OTP sent successfully and logged to backend console for development mode."

  - task: "OTP Authentication (Verify OTP)"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Verified via curl - JWT token returned, user created"
      - working: true
        agent: "testing"
        comment: "✅ TESTED: POST /api/auth/verify-otp works correctly. JWT token returned, user profile created with referral code."

  - task: "User Registration (Complete Profile)"
    implemented: true
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented but not tested yet"

  - task: "Document Upload"
    implemented: true
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented with auto-delete timer support"

  - task: "Document List"
    implemented: true
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented with pagination"

  - task: "Customer Upload Portal API"
    implemented: true
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/documents/customer-upload/{merchant_code} - supports 5/10/15 min self-destruct"

  - task: "Dashboard Stats"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Tested via curl - returns document counts and subscription info"

  - task: "Start 7-Day Trial"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Tested via curl - trial activated with 7-day expiry"

  - task: "Subscription Plans"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Returns Free (20 docs) and Unlimited (₹250/month) plans"

  - task: "Trial Expiry Check (Background)"
    implemented: true
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Endpoint /api/admin/check-trials for manual trigger"

frontend:
  - task: "Landing Page (No WhatsApp references)"
    implemented: true
    working: true
    file: "LandingPage.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified - 'Secure Document Sharing for Print Shops' headline"

  - task: "Dark Mode Toggle"
    implemented: true
    working: true
    file: "ThemeContext.js, ThemeToggle.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified - dark mode toggles correctly"

  - task: "Customer Upload Portal"
    implemented: true
    working: true
    file: "CustomerUpload.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified - shows 5/10/15 min timer options"

  - task: "Login Page"
    implemented: true
    working: "NA"
    file: "Login.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented - needs e2e testing"

  - task: "Signup Page"
    implemented: true
    working: "NA"
    file: "Signup.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented with 7-day trial banner"

  - task: "Dashboard (No Referral System)"
    implemented: true
    working: "NA"
    file: "Dashboard.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Removed referral sections, added customer portal info"

  - task: "Pricing Page"
    implemented: true
    working: "NA"
    file: "Pricing.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Shows Free (20 docs) and Unlimited (₹250/month, 7-day trial)"

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 1
  run_ui: true

test_plan:
  current_focus:
    - "OTP Authentication Flow (E2E)"
    - "Customer Upload Portal API"
    - "Document Upload with auto-delete"
    - "Dashboard functionality"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Major refactor completed:
      1. Fixed white screen bug (corrupted quotes in CustomerUpload.js)
      2. Refactored backend from MongoDB to PostgreSQL/Supabase structure
      3. Backend currently uses mock in-memory DB (Supabase credentials placeholder)
      4. Removed WhatsApp references from landing page
      5. Removed referral system from dashboard
      6. Implemented 7-day trial management logic
      7. Customer upload portal with 5/10/15 min self-destruct
      
      Testing needed:
      - Full auth flow (OTP send/verify → registration)
      - Document upload and list
      - Customer upload portal integration
      - Dashboard stats display
      - Dark mode persistence
      
      Auth for testing:
      - Send OTP to any +91XXXXXXXXXX phone
      - OTP will be printed in backend logs
      - Use that OTP to verify and get JWT token
