# Data Collection System - User Guide

## **Intended Use Case: Daily Operations Data Collection**

The data collection system is designed for **daily operational metrics tracking** across the SQCDIP (Safety, Quality, Cost, Delivery, Inventory, Production) pillars.

## **User Experience Flow:**

### **1. Accessing Data Collection**
- Users navigate to any pillar page (Safety, Quality, etc.)
- In the header, they see a "Collect Data" button with a clipboard icon
- If data already exists for the selected date, the button shows "Edit Data" with a checkmark
- If no questions are configured, the button shows "No Questions" and is disabled

### **2. Opening the Modal**
- Clicking the button opens a modal titled "Daily Data Collection - [Pillar Name]"
- Shows the selected date being collected for
- If editing existing data, displays a green checkmark with "You have already submitted data for this date"
- If no data exists for the selected date, the button shows "Collect Data" with a clipboard icon
- If data exists for the selected date, the button shows "Edit Data" with a pencil icon

### **3. Form Experience**
- **Dynamic Questions**: Questions are loaded from the database, allowing administrators to configure what data to collect without code changes
- **Multiple Question Types**:
  - Text input fields
  - Number inputs  
  - Yes/No checkboxes
  - Single-select dropdowns
  - Multi-select checkboxes
  - Text areas for longer responses

### **4. Conditional Logic**
- **Smart Form Flow**: Questions can be conditionally shown based on previous answers
- Example: "How many incidents occurred?" → If >0, shows detailed description fields for each incident
- **Real-time Updates**: Form dynamically shows/hides questions as user answers

### **5. Special Safety Features**
- **Dynamic Incident Details**: When users report safety incidents, the form automatically generates description fields for each incident
- **Validation**: Required fields are marked with red asterisks and validated before submission

### **6. Submission & Feedback**
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Shows spinner during submission
- **Error Handling**: Displays specific error messages if submission fails
- **Success Flow**: Modal closes automatically on successful submission

## **Key Benefits for Users:**

1. **Flexible Data Collection**: Administrators can add/modify questions without developer intervention
2. **Intelligent Forms**: Only relevant questions are shown based on user responses
3. **Daily Tracking**: Designed for consistent daily operational data collection
4. **Edit Capability**: Users can update previously submitted data
5. **Validation**: Prevents incomplete or invalid data submission
6. **Responsive Design**: Works across different devices and screen sizes

## **Technical Architecture**

### **Database-Driven Questions**
- Questions are stored in `pillar_questions` table with configurable properties
- Supports conditional logic through `conditional_parent` and `conditional_value` fields
- Multiple question types: boolean, number, select, text, textarea, multi_select

### **Form Handling**
- Uses React Hook Form with Zod validation for robust form management
- Dynamic schema generation based on loaded questions
- Real-time validation and error display

### **Data Storage**
- Responses stored in `pillar_responses` table with JSONB for flexible data types
- Support for complex data structures (e.g., incident details with descriptions)
- Unique constraints prevent duplicate submissions for same user/date/pillar

The system transforms static dashboards into dynamic data collection tools that adapt to operational needs while maintaining data integrity and user experience quality.


Questions to ask: Below is a clear step‑by‑step outline of every pillar, the questions you will ask under each pillar, and the conditions that decide when follow‑up questions appear. I have used the exact question wording from the file except where I removed quote characters or replaced hyphens with spaces, keeping the meaning intact.

**Overall sequence**

1. Delivery
2. Inventory
3. Production
4. Quality
5. Safety

---

### 1. Delivery pillar

* Ask: **How many containers are expected today?**
  (numeric answer, always required)

There are no follow‑up questions on this pillar.

---

### 2. Inventory pillar

1. Ask: **What models are currently in backlog?**
   (multi select, choose any combination of the eight models listed below)

2. For every model that the user selects, immediately ask the corresponding quantity question:

   * 14 inch selected, ask **How many 14 inch units are in backlog?**
   * 16 inch selected, ask **How many 16 inch units are in backlog?**
   * 20 inch small selected, ask **How many 20 inch small units are in backlog?**
   * 20 inch large selected, ask **How many 20 inch large units are in backlog?**
   * 24 inch selected, ask **How many 24 inch units are in backlog?**
   * 26 inch selected, ask **How many 26 inch units are in backlog?**
   * adult small selected, ask **How many adult small units are in backlog?**
   * adult large selected, ask **How many adult large units are in backlog?**

All of these quantity questions are numeric and required, but each one only appears for the models actually chosen in step 1.

---

### 3. Production pillar

* Ask: **What is the planned output for today?**
  (numeric, required)

* Ask: **What was the actual output yesterday?**
  (numeric, required)

There is no conditional branching on this pillar.

---

### 4. Quality pillar

1. Ask: **Were there any major quality issues yesterday?**
   (single‑select, most implementations use Yes or No)

2. If the reply is **No**, the pillar ends here.

3. If the reply is **Yes**, continue:

   * Ask: **What type of quality issues occurred?**
     (multi select, choose one or many of the seven types below)

   * For every type selected, ask a free‑text detail question:

     * Customer complaints selected, ask **Customer complaints, describe the details:**
     * Defective products selected, ask **Defective products, describe the details:**
     * Supplier issues selected, ask **Supplier issues, describe the details:**
     * Process failures selected, ask **Process failures, describe the details:**
     * Testing failures selected, ask **Testing failures, describe the details:**
     * Specification deviations selected, ask **Specification deviations, describe the details:**
     * Equipment malfunctions selected, ask **Equipment malfunctions, describe the details:**

Each detail question is a required long‑text response, but it only shows up for the issue types that were picked.

---

### 5. Safety pillar

* Ask: **How many safety incidents occurred yesterday?**
  (single‑select, typical options are 0, 1, 2 or more)

At present the file contains no further safety follow‑ups, so the flow ends here.

---

**Full flow in one glance**

Delivery question, then Inventory selection plus its conditional quantity prompts, then the two Production numbers, followed by the Quality branch (Yes leads to extra issue prompts and detail text boxes, No skips them), and finally the single Safety question.

This ordering and conditional logic matches the display order and dependencies defined in the CSV, giving you a complete map of when each question appears and why.
