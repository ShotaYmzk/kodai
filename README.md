# Mock Timeline Experiment (React Version)

This is a React/Next.js port of the Mock Timeline Experiment application.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Environment Variables:
    Create a `.env.local` file in the root directory with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

-   `src/app`: Next.js App Router pages and API routes.
-   `src/components`: React components.
-   `src/lib`: Utility functions (Data loading, Supabase client).
-   `data`: CSV data files for the experiment.
-   `legacy_python`: Backup of the original Python application.

## Features

-   **Login**: Checks participant status in Supabase.
-   **Condition Selection**: Weak, Mid, Strong filters.
-   **Timeline Simulation**: Displays tweets based on the selected condition and phase.
-   **VAS (Visual Analog Scale)**: Records stress levels before, during, and after the experiment.
-   **Data Persistence**: Saves all logs to Supabase `experiment_logs` table.
