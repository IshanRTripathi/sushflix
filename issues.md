# Sushflix Application Issues

This document lists the identified issues in the Sushflix application, ordered by their urgency to be addressed.

## High Urgency Issues

These issues directly impact core functionality, security, or user experience and should be addressed immediately.

1.  **Lack of Robust Error Handling:**
    *   **Description:** The application lacks comprehensive error handling and logging, making it difficult to debug issues and provide useful feedback to users. This can lead to a poor user experience and make it harder to identify and fix problems quickly.
    *   **Impact:** Poor user experience, difficult debugging, potential data loss or corruption.
    *   **Location:** Throughout the application, both frontend and backend.

2.  **Inconsistent Button Colors:**
    *   **Description:** In some places of the application, the buttons have different colors, or the hover colors are wrong.
    *   **Impact:** Bad UI, poor user experience.
    * **Location:** `src/components/pages/HomePage.tsx`

3. **Development Login in Auth Middleware:**
    * **Description:** The development login bypass is implemented directly in the authentication middleware, which is not ideal.
    * **Impact:** Makes the code less secure and maintainable.
    * **Location:** `src/server/middlewares/auth.js`

## Medium Urgency Issues

These issues impact functionality or user experience to some extent but are not as critical as high-urgency issues.

1.  **Missing Features from the Roadmap:**
    *   **Description:** Many features from the `features.md` file are not yet implemented, such as user profiles, content browsing/discovery, content interaction (likes, comments, sharing), direct messaging, tipping, creator dashboard, email notifications.
    *   **Impact:** Limited functionality, reduced user engagement.
    *   **Location:** Throughout the application, both frontend and backend.

2. **Lack of validation:**
    * **Description:** The requests dont have any validation.
    * **Impact:** Security vulnerabilities and bugs.
    * **Location:** `src/server/routes`

3.  **Hardcoded Data/Placeholders:**
    *   **Description:** The UI often uses hardcoded data or placeholder images, which needs to be replaced with dynamic content fetched from the backend.
    *   **Impact:** Unrealistic UI, poor user experience, not representative of the actual data.
    *   **Location:** `src/components` (e.g., the profile card in `HomePage.tsx`).

4. **Unclear project structure:**
    * **Description:** The project has some files in not clear locations.
    * **Impact:** makes the code hard to mantain.
    * **Location:** everywhere

## Low Urgency Issues

These issues are mostly related to polish, minor improvements, or future enhancements.

1.  **Lack of Admin Panel:**
    *   **Description:** There's no admin panel for content/user moderation or site configuration.
    *   **Impact:** Difficult to manage content and users, potential for abuse.
    *   **Location:** Backend and frontend.

2.  **Missing Onboarding Tutorial:**
    *   **Description:** New users lack an onboarding experience or tutorial.
    *   **Impact:** Poor first-time user experience.
    *   **Location:** Frontend.

3. **No Digital Rights Management:**
    * **Description:** There is no DRM implemented.
    * **Impact:** Makes the content more easy to copy.
    * **Location:** backend.