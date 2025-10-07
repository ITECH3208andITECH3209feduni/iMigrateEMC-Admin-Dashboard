
# iMigrateEMC - Admin Booking Dashboard

A comprehensive, secure, and real-time dashboard for iMigrateEMC administrators to manage client bookings, handle partner expressions of interest (EOIs), manage services, and communicate directly with clients via live chat.

 <img width="1328" height="652" alt="image" src="https://github.com/user-attachments/assets/f8370d1d-9a3f-4597-a93a-36f53aed6a69" />


---

## ✨ Key Features
<img width="1358" height="337" alt="image" src="https://github.com/user-attachments/assets/eeba7c14-e02c-4d84-bd9a-2d970f908cae" />


- **Secure Authentication**: Role-based access control ensures only users with an `admin` role can access the dashboard.
- **Booking Management**:
    - View all client bookings in a clean, filterable table.
    - Reschedule appointments with an intuitive modal.
    - Mark bookings as "Done" to track completion.
    - Remove bookings when necessary.
- **Partner EOI Management**:
    - Track and manage expressions of interest from potential partners.
    - Update the status of each EOI (New, Contacted, Closed) directly from the dashboard.
- **Live Chat**:
    - Engage in real-time, one-on-one conversations with clients.
    - View a list of all clients who have initiated a chat.
    - Securely send and receive messages.
- **Service Management**:
    - Dynamically add new consultation services with titles, descriptions, durations, and costs.
    - View and remove existing services.
- **User Management**:
    - View a list of all registered users.
    - Grant or revoke `admin` privileges to other users.

---

## 🚀 Tech Stack

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend-as-a-Service**: [Supabase](https://supabase.io/)
    - **Authentication**: Manages user sign-up, login, and role-based access.
    - **Postgres Database**: Stores all application data (bookings, users, messages, etc.).
    - **Realtime Subscriptions**: Powers the live chat feature.
- **Module Loading**: Uses `importmap` for CDN-based package management.

---

## 🏁 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- A web browser.
- A Supabase account ([Sign up for free](https://supabase.com/)).

### Supabase Project Setup

1.  **Create a New Project**:
    - Log in to your Supabase account and create a new project.
    - Save your **Project URL**, **anon key**, and **service_role key**. You will need these later.

2.  **Database Schema**:
    - Go to the "SQL Editor" in your Supabase project dashboard.
    - Run the following SQL queries to create the necessary tables.

    ```sql
    -- Consultation Types Table (Services)
    CREATE TABLE consultation_type (
        id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        created_at timestamptz DEFAULT now() NOT NULL,
        title text NOT NULL,
        description text,
        duration integer, -- in minutes
        price numeric NOT NULL
    );

    -- Bookings Table
    CREATE TABLE bookings (
        id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        created_at timestamptz DEFAULT now() NOT NULL,
        booking_date date NOT NULL,
        time_slot text NOT NULL,
        purpose text,
        questions text,
        total_cost numeric NOT NULL,
        payment_method text,
        document_urls text[],
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        status text DEFAULT 'scheduled',
        consultation_type_id bigint REFERENCES consultation_type(id) ON DELETE SET NULL
    );

    -- Chat Messages Table
    CREATE TABLE chat_messages (
        id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        created_at timestamptz DEFAULT now() NOT NULL,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        sender_is_admin boolean DEFAULT false NOT NULL
    );

    -- Partner EOI Table
    CREATE TABLE partner_eoi (
        id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        created_at timestamptz DEFAULT now() NOT NULL,
        name text NOT NULL,
        email text NOT NULL,
        company_name text,
        phone_number text,
        message text NOT NULL,
        status text DEFAULT 'new' NOT NULL
    );

    -- Enable Realtime on chat_messages table
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    ```
    *Note: For a production app, you should set up Row Level Security (RLS) policies on these tables for enhanced security.*

3.  **Create an Admin User**:
    - Go to the "Authentication" section in your Supabase dashboard.
    - Invite or create a new user.
    - Once the user is created, click on the user and under "User Management", find the "User App Metadata" section.
    - Add the following JSON to give the user admin privileges:
      ```json
      {
        "role": "admin"
      }
      ```
    - Save the changes. This user will now be able to log in to the admin dashboard.

### Local Installation

1.  **Clone the Repository**:
    ```sh
    git clone https://github.com/your-username/imigrate-emc-dashboard.git
    cd imigrate-emc-dashboard
    ```

2.  **Configure Supabase Credentials**:
    - Open the file `services/supabase.ts`.
    - Replace the placeholder values for `supabaseUrl`, `supabaseAnonKey`, and `supabaseServiceKey` with the keys from your Supabase project.

    ```typescript
    // In services/supabase.ts

    const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
    const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
    const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; 
    ```
    **Security Note**: For a production application, it is strongly recommended to use environment variables to store these keys instead of hardcoding them.

3.  **Run the Application**:
    - You can run this project using any simple static file server. One of the easiest ways is using the `serve` package.
    - Install `serve` globally:
      ```sh
      npm install -g serve
      ```
    - Run the server from the project's root directory:
      ```sh
      serve -s .
      ```
    - Open your browser and navigate to the local URL provided by `serve` (e.g., `http://localhost:3000`).

---

## 📂 Project Structure

```
.
├── components/          # React components
│   ├── modals/          # Modal components
│   ├── icons/           # SVG icon components
│   ├── AccessDenied.tsx
│   ├── AdminTools.tsx
│   ├── BookingsTable.tsx
│   ├── Dashboard.tsx
│   └── ...
├── services/            # Service configurations
│   └── supabase.ts      # Supabase client setup
├── App.tsx              # Main app component with auth logic
├── index.html           # Main HTML file
├── index.tsx            # React entry point
├── metadata.json        # Project metadata
├── README.md            # This file
└── types.ts             # TypeScript type definitions
```

---

## 🔐 Environment Variables

For better security and portability, you should manage your Supabase keys using environment variables.

1.  Create a `.env` file in the root of your project.
2.  Add your keys to this file:
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    VITE_SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    ```
3.  Update `services/supabase.ts` to use these variables. This typically requires a build tool like Vite or Create React App to process them.
    ```typescript
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
    ```
