// The walkthroughs shown by usePageGuide / <GuideOverlay>. A step with a target highlights the element marked
// data-guide="<target>" (a step whose element isn't on screen - e.g. a button only some people get - is skipped);
// a step without one shows in the middle of the screen.
export type GuideStep = {
    target?: string
    title: string
    body: string
}

export type PageGuide = {
    title: string
    steps: GuideStep[]
}

export const PAGE_GUIDES: Record<string, PageGuide> = {
    'exam-office-overview': {
        title: 'Exam Office',
        steps: [
            { title: 'Welcome to the Exam Office', body: 'This is where you follow every assessment from grade entry to results. Here is a quick look around - it takes under a minute.' },
            { target: 'grades-tabs', title: 'Everything in one place', body: 'These tabs are the steps of the job: track submissions, approve grades, keep the exam timetable and check the broadsheet.' },
            { target: 'approval-routing', title: 'Who approves grades', body: 'Each part of the school sends its grades to the class master, an admin or the exam office. Exam officer means they wait on the exam office; Admin means they wait on the school admins.' },
            { target: 'exam-metrics', title: 'Where the term stands', body: 'How many assessments are approved, waiting for approval, not yet submitted, or sent back to teachers.' },
            { target: 'exam-outstanding', title: 'Who still owes grades', body: 'Teachers with assessments not submitted or returned for changes, and which subjects. Follow up with the ones at the top first.' },
            { target: 'exam-upcoming', title: 'Papers this week', body: 'The exam papers coming up in the next 7 days, from the published exam timetables.' },
            { target: 'exam-progress', title: 'Progress by class', body: 'How far each class is - approved assessments out of all of them.' },
            { target: 'guide-button', title: 'Need this again?', body: 'Press Guide on any page to replay its walkthrough.' },
        ],
    },
    'exam-office-submissions': {
        title: 'Submissions',
        steps: [
            { title: 'Submissions', body: 'Every open assessment this term, the teacher who owns it, and where it stands.' },
            { target: 'approval-routing', title: 'Who approves', body: 'Shows who approves grades in each part of the school - the class master, an admin or the exam office.' },
            { target: 'submission-status', title: 'Filter by status', body: 'Not submitted, awaiting approval, returned or approved. Pick one to see just those.' },
            { target: 'submission-filters', title: 'Find an assessment', body: 'Narrow the list by term, class, or a teacher or subject name.' },
            { target: 'submission-list', title: 'The list', body: 'Each row is one subject for one class. When one waits on you, an Approve button appears on it.' },
        ],
    },
    'exam-office-approval': {
        title: 'Grade Approval',
        steps: [
            { title: 'Grade Approval', body: 'Grades teachers have submitted for approval. Check them, then approve or send them back with a note.' },
            { target: 'approval-counts', title: 'At a glance', body: 'How many submissions are pending, approved and returned.' },
            { target: 'approval-approver', title: 'Whose approvals', body: 'Switch between the grades that go to the exam office, admins or class masters.' },
            { target: 'approval-search', title: 'Find a submission', body: 'Search by subject or teacher, or open the filter to narrow by status, class or teacher.' },
            { target: 'approval-list', title: 'Open one to review it', body: 'Tap a submission to see every student\'s score before you decide.' },
        ],
    },
    'exam-office-approval-review': {
        title: 'Reviewing grades',
        steps: [
            { title: 'Review a submission', body: 'Everything you need to decide whether these grades are ready.' },
            { target: 'review-status', title: 'Where it stands', body: 'Pending review, approved or returned to the teacher.' },
            { target: 'review-stats', title: 'The class at a glance', body: 'How many students, the average score and the pass rate. A very low or very high rate is worth a second look.' },
            { target: 'review-distribution', title: 'Spread of results', body: 'How the class did overall - pass versus fail.' },
            { target: 'review-flags', title: 'Worth a second look', body: 'For continuous assessment: patterns like missing weeks or a big gap between CA and the test.' },
            { target: 'review-scores', title: 'Every student', body: 'Each student\'s score and grade. Check any that look wrong before you approve.' },
            { target: 'review-actions', title: 'Decide', body: 'Approve releases the grades. Return sends them back to the teacher with a note on what to fix.' },
            { target: 'review-reopen', title: 'Already approved?', body: 'Reopen lets the teacher edit an approved grade again while the academic year is still open.' },
        ],
    },
    'exam-office-timetable': {
        title: 'Exam Timetables',
        steps: [
            { title: 'Exam Timetables', body: 'Each assessment in a term (1st Test, Exam...) has its own timetable. Set it up, add the papers, then publish it.' },
            { target: 'exam-term', title: 'Pick the term', body: 'Exam timetables are kept term by term.' },
            { target: 'exam-assessments', title: 'One timetable per assessment', body: 'Each tab is an assessment in the term and shows whether its timetable is a draft, published or not set up yet.' },
            { target: 'exam-setup', title: 'Set it up', body: 'Give it a title, the exam period and the instructions for candidates. Then add its papers.' },
            { target: 'exam-timetable-header', title: 'The timetable', body: 'Its title, exam period and status. Drafts are only seen by the exam office and admins; teachers and parents see it once it is published - and parents get a notification.' },
            { target: 'exam-missing', title: 'Nothing forgotten', body: 'Subjects a class takes that have no paper yet. Tap one to add its paper with the classes already picked.' },
            { target: 'exam-add-paper', title: 'Add papers', body: 'One paper can be sat by several classes together, with several invigilators. Clashes are stopped for you.' },
            { target: 'exam-papers', title: 'Day by day', body: 'The papers in date order. Use the pencil to change one or the bin to remove it.' },
            { target: 'exam-publish', title: 'Publish', body: 'When it\'s ready, publish it. Teachers see it and parents get a notification. Unpublish to rework it.' },
            { target: 'exam-download', title: 'Download PDF', body: 'A page per class for the notice board, or the full timetable. Its look is set under PDF Design.' },
            { target: 'exam-pdf-design', title: 'PDF Design', body: 'Change the heading, colour, layout and what each paper shows on the downloaded timetable.' },
        ],
    },
    'exam-timetable-form': {
        title: 'Timetable details',
        steps: [
            { target: 'tt-form-title', title: 'Title', body: 'Printed at the top of the timetable, e.g. First Term Examination.' },
            { target: 'tt-form-period', title: 'Exam period', body: 'The first and last day of the exams. Papers can only be set on days inside it.' },
            { target: 'tt-form-instructions', title: 'Instructions to candidates', body: 'Starts with the usual exam rules - edit them for your school. They show on the timetable and every printout.' },
        ],
    },
    'exam-paper-form': {
        title: 'Adding a paper',
        steps: [
            { target: 'paper-subject', title: 'Subject and paper', body: 'Pick the subject, and name the paper if it has more than one - Paper 1 (Objectives), Paper 2 (Theory), Practical...' },
            { target: 'paper-classes', title: 'Who sits it', body: 'Pick every class that sits this paper together, e.g. all of JSS 1 in the hall.' },
            { target: 'paper-time', title: 'When', body: 'The date (inside the exam period) and times. The buttons fill in the usual morning, midday and afternoon sittings.' },
            { target: 'paper-invigilators', title: 'Venue and invigilators', body: 'Where it\'s sat and who watches. You\'ll be stopped if a class or invigilator already has a paper at that time.' },
            { target: 'paper-save', title: 'Save', body: '"Save and add another" keeps the day, classes and venue, and starts the next paper where this one ends.' },
        ],
    },
    'exam-office-broadsheet': {
        title: 'Broadsheet',
        steps: [
            { title: 'Broadsheet', body: 'Every student against every subject for a class and term, built from the report cards.' },
            { target: 'broadsheet-filters', title: 'Choose the class and term', body: 'Pick a class (and stream for SSS) and a term to build its broadsheet.' },
            { target: 'broadsheet-summary', title: 'At a glance', body: 'Students, how many passed, the class average and when the report cards were generated.' },
            { target: 'broadsheet-table', title: 'The sheet', body: 'Positions, each subject\'s score and the average. Print it for staff meetings.' },
        ],
    },
    'exam-office-timetable-design': {
        title: 'Exam Timetable Design',
        steps: [
            { title: 'Design the PDF', body: 'How the exam timetable looks when staff and parents download it. It applies to every exam timetable.' },
            { target: 'design-style', title: 'Style', body: 'The heading, colour, page orientation and an optional footer note.' },
            { target: 'design-show', title: 'What to show', body: 'Logo, paper length, venue, instructions and signature lines. Invigilators only ever show on the full timetable.' },
            { target: 'design-preview', title: 'Live preview', body: 'Shows a real timetable as it will download. Switch between a class page and the full timetable. Press Save Settings when you\'re happy.' },
        ],
    },

    // ---- Teacher portal
    'teacher-dashboard': {
        title: 'Your dashboard',
        steps: [
            { title: 'Welcome', body: 'Your day at a glance: your classes, how they are doing, and what needs you. A quick look around.' },
            { target: 'teacher-clock', title: 'Clock in and out', body: 'Clock in when you arrive and out when you leave. It only works on the school grounds.' },
            { target: 'teacher-performance', title: 'How a class is doing', body: 'Pick a subject, term and assessment to see the class average, attendance and grade spread.' },
            { target: 'guide-button', title: 'Help on every page', body: 'Guide replays a walkthrough like this one; Help explains what a page is for and what you need first.' },
        ],
    },
    'teacher-attendance': {
        title: 'Mark Attendance',
        steps: [
            { title: 'Mark Attendance', body: 'Take your class register for the day. Parents are told when their child is absent, late or excused.' },
            { target: 'attendance-summary', title: 'Today so far', body: 'How many are present, absent, late and excused, and the attendance rate.' },
            { target: 'attendance-pick', title: 'Class and date', body: 'Pick your class and the day. You can go back to an earlier day to correct it.' },
            { target: 'attendance-roll', title: 'Two roll calls', body: 'Where your school takes two roll calls a day, pick which one you are taking. A student counts as present only when present at both.' },
            { target: 'attendance-actions', title: 'Quick start', body: 'Mark everyone present, then change the few who are late, absent or excused.' },
            { target: 'attendance-list', title: 'Each student', body: 'Tick Present, Late or Excused. Leave all three unticked for absent. Excused needs a reason.' },
            { target: 'attendance-save', title: 'Save', body: 'Nothing is recorded until you press Save Attendance.' },
        ],
    },
    'teacher-grade-entry': {
        title: 'Grade Entry',
        steps: [
            { title: 'Grade Entry', body: 'Enter your students\' scores for each assessment, then submit them for approval.' },
            { target: 'grades-pick', title: 'Subject and term', body: 'Pick the class subject you teach and the term.' },
            { target: 'grades-returned', title: 'Sent back to you', body: 'If an approver returned your grades, their note shows here. Fix the scores and submit again.' },
            { target: 'grades-continuous', title: 'Continuous assessment', body: 'Assessments run as CA + a formal test are recorded on their own page - open them from here.' },
            { target: 'grades-table', title: 'Enter scores', body: 'Type each student\'s score. Locked assessments are read-only.' },
            { target: 'grades-actions', title: 'Save, then complete', body: 'Save keeps your work as a draft. Complete Assessment sends it for approval - you can\'t edit it after that unless it is returned.' },
        ],
    },
    'teacher-continuous': {
        title: 'Continuous Assessment',
        steps: [
            { title: 'Continuous Assessment', body: 'Record classwork across the term, then the formal test. Together they make the score.' },
            { target: 'ca-progress', title: 'Where you are', body: 'Step 1 is the CA recordings; step 2 opens once you submit the CA.' },
            { target: 'ca-weeks', title: 'Lock as you go', body: 'Lock each week (or part) once every student has a mark. Locked marks can\'t change without an unlock request.' },
            { target: 'ca-insight', title: 'Class insight', body: 'Who is strong, steady or needs support, and who is improving or slipping.' },
            { target: 'ca-students', title: 'Enter marks', body: 'Each student\'s marks for every part, then the formal test. The score updates as you type.' },
            { target: 'ca-actions', title: 'Save and submit', body: 'Save keeps your work. Submit CA closes the CA; then enter the test and submit for approval.' },
        ],
    },
    'teacher-approval': {
        title: 'Grade Approval',
        steps: [
            { title: 'Your approval queue', body: 'As class master, you approve the grades your class\'s subject teachers submit.' },
            { target: 'teacher-approval-counts', title: 'At a glance', body: 'How many submissions are pending, approved and returned.' },
            { target: 'teacher-approval-list', title: 'Review each one', body: 'Open a submission to check the scores, then approve it or return it with a note.' },
        ],
    },
    'teacher-report-cards': {
        title: 'Report Cards',
        steps: [
            { title: 'Report cards for your class', body: 'The admin generates your class\'s report cards. You check them, add your comments and approve them - then parents can see them.' },
            { target: 'report-review', title: 'Review the class', body: 'How many cards wait for you. Approve them when you\'re done, or send them back to the admin if a score looks wrong.' },
            { target: 'report-list', title: 'Add your comments', body: 'Open each card to write your comment for that student. Comments lock once you approve.' },
        ],
    },
    'teacher-timetable': {
        title: 'My Timetable',
        steps: [
            { title: 'My Timetable', body: 'Your weekly teaching schedule.' },
            { target: 'teacher-timetable-class', title: 'Pick a class', body: 'See the timetable of a class you teach.' },
            { target: 'teacher-timetable-grid', title: 'The week', body: 'Each period and day, with the subject, teacher and room. Double periods are marked.' },
            { target: 'teacher-timetable-download', title: 'Download', body: 'Save the class timetable as a PDF.' },
        ],
    },
    'teacher-behaviour': {
        title: 'Behaviours',
        steps: [
            { title: 'Behaviours', body: 'Record good and bad behaviour notes for your students.' },
            { target: 'behaviour-class', title: 'Pick a class', body: 'Choose one of your classes to see and add its notes.' },
            { target: 'behaviour-list', title: 'Notes', body: 'Every note recorded for the class, newest first.' },
        ],
    },
    'staff-leave': {
        title: 'My Leave Requests',
        steps: [
            { title: 'Leave', body: 'Ask for time off and follow whether it is approved.' },
            { target: 'leave-new', title: 'New request', body: 'Pick the type of leave, the dates and give a reason.' },
            { target: 'leave-list', title: 'Your requests', body: 'Each request and its status: pending, approved or rejected.' },
        ],
    },
    'staff-clock-in': {
        title: 'Clock In / Out',
        steps: [
            { title: 'Clock in and out', body: 'Record when you arrive and leave. The school checks you are on its grounds.' },
            { target: 'clock-card', title: 'Today', body: 'Press Clock In when you arrive and Clock Out when you leave. Allow location access when your browser asks.' },
        ],
    },
    'teacher-exam-timetable': {
        title: 'Exam Timetable',
        steps: [
            { title: 'Exam Timetable', body: 'When and where each class sits its papers, as published by the exam office.' },
            { target: 'exam-term', title: 'Pick the term', body: 'Exam timetables are kept term by term.' },
            { target: 'exam-assessments', title: 'Pick the assessment', body: 'Each tab is a published timetable - 1st Test, Exam and so on.' },
            { target: 'exam-timetable-header', title: 'The timetable', body: 'Its exam period and the instructions for candidates.' },
            { target: 'exam-mine', title: 'Your invigilation', body: 'Turn this on to see only the papers you invigilate.' },
            { target: 'exam-papers', title: 'Day by day', body: 'Every paper in date order, with the classes sitting it, the venue and the invigilators.' },
            { target: 'exam-download', title: 'Download PDF', body: 'A page per class, or the full timetable.' },
        ],
    },

    // ---- Accountant / finance
    'accountant-dashboard': {
        title: 'Finance dashboard',
        steps: [
            { title: 'Welcome', body: 'The school\'s money at a glance: what is collected, what is owed and the latest payments.' },
            { target: 'fin-quick', title: 'Shortcuts', body: 'Create a fee structure, record a payment or open the reports in one click.' },
            { target: 'fin-summary', title: 'The term in numbers', body: 'Expected, collected and outstanding fees for the term.' },
            { target: 'fin-charts', title: 'Revenue and arrears', body: 'How collections are going over time, and where money is still owed.' },
            { target: 'fin-recent', title: 'Latest payments', body: 'The most recent payments recorded, with their receipts.' },
        ],
    },
    'accountant-students': {
        title: 'Students',
        steps: [
            { title: 'Students and their fees', body: 'Every student with where they stand on fees.' },
            { target: 'fin-students-summary', title: 'At a glance', body: 'How many students are paid up, part paid or owing.' },
            { target: 'fin-students-list', title: 'Each student', body: 'Search for a student and open them to see their fees and payments.' },
        ],
    },
    'finance-fees': {
        title: 'Student fees',
        steps: [
            { title: 'Student fees', body: 'Each student\'s fees, what they have paid and what they still owe.' },
            { target: 'fin-fees-tabs', title: 'Fees & Payments', body: 'These tabs hold everything about fees: records, payments, reports, discounts, structures and categories.' },
            { target: 'fin-fees-list', title: 'Find a student', body: 'Search and pick a student.' },
            { target: 'fin-fees-record', title: 'Their fees', body: 'Every fee charged to them, paid so far, balance, and the installment plan if there is one.' },
        ],
    },
    'finance-payment': {
        title: 'Record a payment',
        steps: [
            { title: 'Record a payment', body: 'Record money a parent paid, against one or more of the student\'s fees, and print the receipt.' },
            { target: 'pay-student', title: 'The student', body: 'Search for the student who is paying.' },
            { target: 'pay-method', title: 'How they paid', body: 'Cash, bank or mobile money - add the reference for bank and mobile money so it can be traced.' },
            { target: 'pay-fees', title: 'What it pays for', body: 'Add the fees this payment covers. A fee on an installment plan suggests the amount due now.' },
            { target: 'pay-totals', title: 'Check the totals', body: 'The amount allocated has to match what was paid.' },
            { target: 'pay-submit', title: 'Save', body: 'Saves the payment and gives you the receipt to print or share.' },
            { target: 'pay-recent', title: 'Recent payments', body: 'Payments already recorded, newest first.' },
        ],
    },
    'finance-fee-reports': {
        title: 'Fees dashboard',
        steps: [
            { title: 'Fees dashboard', body: 'The school\'s fee position for a year and term.' },
            { target: 'fin-report-tabs', title: 'More reports', body: 'Outstanding fees, daily collections, payment history and student balances.' },
            { target: 'fin-report-filters', title: 'Year and term', body: 'Pick the academic year and term to report on.' },
            { target: 'fin-report-insights', title: 'Key insights', body: 'What stands out: collection rate, classes behind, overdue amounts.' },
        ],
    },
    'finance-discounts': {
        title: 'Discounts',
        steps: [
            { title: 'Discounts', body: 'Reduce a student\'s fees - a scholarship, a sibling or staff discount.' },
            { target: 'fin-discount-summary', title: 'At a glance', body: 'How many discounts are active and how much they take off.' },
            { target: 'fin-discount-add', title: 'Create a discount', body: 'Pick the student, the fees, a percentage or fixed amount, and a reason.' },
            { target: 'fin-discount-list', title: 'All discounts', body: 'Every discount given, who for and how much.' },
        ],
    },
    'finance-structures': {
        title: 'Fee structures',
        steps: [
            { title: 'Fee structures', body: 'What the school charges: each fee, for which students, how much and when it is due.' },
            { target: 'fin-structure-add', title: 'Add a fee', body: 'Charge a fee to all students, some classes, or chosen students.' },
            { target: 'fin-structure-filter', title: 'Filter', body: 'Narrow by term, class, student type or gender.' },
            { target: 'fin-structure-list', title: 'Every fee', body: 'Each fee with its amount, due date, and whether it can be paid in installments.' },
        ],
    },
    'finance-structure-add': {
        title: 'Add a fee structure',
        steps: [
            { target: 'fee-term', title: 'Term', body: 'The term this fee belongs to.' },
            { target: 'fee-category', title: 'Category', body: 'What the fee is for - Tuition, Exam, PTA, Development...' },
            { target: 'fee-amount', title: 'Amount and due date', body: 'How much each student pays and the deadline.' },
            { target: 'fee-installment', title: 'Installments', body: 'Allow paying in parts, and optionally set a plan - 2 or 3 parts, monthly or one per term.' },
            { target: 'fee-assign', title: 'Who pays it', body: 'All students, specific classes (and a stream), or chosen students - and new or returning students only, or one gender.' },
            { target: 'fee-save', title: 'Create', body: 'The fee is charged straight away to every student it applies to.' },
        ],
    },
    'finance-categories': {
        title: 'Fee categories',
        steps: [
            { title: 'Fee categories', body: 'The kinds of fee the school charges - Tuition, Exam, PTA and so on.' },
            { target: 'fin-category-add', title: 'Add a category', body: 'Add one before creating a fee of that kind.' },
            { target: 'fin-category-list', title: 'Categories', body: 'Every category and how many fees use it.' },
        ],
    },
    'finance-expenses': {
        title: 'Expenses',
        steps: [
            { title: 'Expenses', body: 'Record what the school spends, so income and spending can be compared.' },
            { target: 'fin-expense-summary', title: 'At a glance', body: 'Spending for the period.' },
            { target: 'fin-expense-list', title: 'Every expense', body: 'Add an expense with its category, amount and date. Search and filter the list.' },
            { target: 'fin-expense-category', title: 'By category', body: 'Where the money goes.' },
        ],
    },
    'finance-transactions': {
        title: 'Transactions',
        steps: [
            { title: 'Transactions', body: 'Every money movement - fees charged, payments in, discounts and expenses - in one list.' },
            { target: 'fin-tx-summary', title: 'At a glance', body: 'Money in and out for the period.' },
            { target: 'fin-tx-list', title: 'The list', body: 'Each transaction with its date, type and amount. Filter to find one.' },
        ],
    },
    'finance-ledger': {
        title: 'Student ledger',
        steps: [
            { title: 'Student ledger', body: 'A student\'s account like a bank statement: every charge and payment with the running balance.' },
            { target: 'fin-ledger-summary', title: 'At a glance', body: 'Charges, payments and balance.' },
            { target: 'fin-ledger-list', title: 'Entries', body: 'Every debit (fee charged) and credit (payment, discount) in order.' },
        ],
    },
    'payroll-overview': {
        title: 'Payroll',
        steps: [
            { title: 'Payroll', body: 'Pay staff every month: set their salaries, run payroll for the period, then publish payslips. Here is a quick look around.' },
            { target: 'pay-tabs', title: 'The payroll sections', body: 'Salaries, reusable templates, payroll runs, the payslip design, and payslips.' },
            { target: 'pay-stats', title: 'Payroll at a glance', body: 'How many staff have a salary, the average and highest, and the gross monthly total.' },
            { target: 'pay-cycle', title: 'The monthly cycle', body: 'Three steps every month: set salaries, start a run, then generate and publish. Each card opens that step.' },
            { target: 'pay-latest-run', title: 'Latest run', body: 'Where the newest payroll run stands, and a button for its next step.' },
            { target: 'pay-add-salary', title: 'Add a salary', body: 'Give a staff member a salary. Only staff with a salary go on a payroll run.' },
            { target: 'pay-start-run', title: 'Start a run', body: 'When salaries are set, start this month\'s payroll run here.' },
        ],
    },
    'payroll-salaries': {
        title: 'Salary structures',
        steps: [
            { title: 'Salary structures', body: 'What each staff member earns: basic pay, allowances, deductions and net pay.' },
            { target: 'pay-salary-stats', title: 'Totals', body: 'Staff on payroll and the average, highest and lowest salary.' },
            { target: 'pay-add-salary', title: 'Add a salary', body: 'Set up pay for a staff member, from a template or by hand.' },
            { target: 'pay-templates-link', title: 'Templates', body: 'Save a package once (e.g. "Senior Teacher") and reuse it for many staff.' },
            { target: 'pay-salary-filters', title: 'Find someone', body: 'Search by name or staff ID, sort, and switch between table and cards.' },
            { target: 'pay-salary-list', title: 'Every salary', body: 'Open one to see the breakdown and payslip history, or to edit it.' },
        ],
    },
    'payroll-salary-form': {
        title: 'Salary',
        steps: [
            { target: 'pay-salary-employee', title: 'Who it is for', body: 'Pick an active staff member. Adding one for someone who already has a salary replaces it.' },
            { target: 'pay-salary-template', title: 'Start from a template', body: 'Optional. Fills in the basic pay and every line, which you can still change.' },
            { target: 'pay-salary-basic', title: 'Basic salary', body: 'Monthly basic pay. Percentage allowances and deductions are worked out from it.' },
            { target: 'pay-allowances', title: 'Allowances', body: 'Extra pay such as housing or transport - a fixed amount or a percentage of basic.' },
            { target: 'pay-deductions', title: 'Deductions', body: 'Taken off the pay, such as NASSIT, PAYE or a loan - fixed or a percentage of basic.' },
            { target: 'pay-net-preview', title: 'Net pay', body: 'What the person takes home each month, updated as you type.' },
            { target: 'pay-save', title: 'Save', body: 'The salary is used from the next payroll run you start.' },
        ],
    },
    'payroll-salary-detail': {
        title: 'Salary details',
        steps: [
            { target: 'pay-detail-summary', title: 'Pay at a glance', body: 'Basic, gross and net monthly pay, and the template it came from.' },
            { target: 'pay-detail-breakdown', title: 'Breakdown', body: 'Every allowance and deduction and how it is worked out.' },
            { target: 'pay-detail-history', title: 'Payslip history', body: 'Every payroll run this person was on. Open one to see the payslip.' },
            { target: 'pay-edit-salary', title: 'Change it', body: 'Edit the salary. Runs already started keep the old amounts.' },
        ],
    },
    'payroll-templates': {
        title: 'Salary templates',
        steps: [
            { title: 'Salary templates', body: 'Reusable pay packages, e.g. "Graduate Teacher" or "Support Staff", so you don\'t type the same lines for everyone.' },
            { target: 'pay-add-template', title: 'Add a template', body: 'Set the basic pay, allowances and deductions once.' },
            { target: 'pay-template-list', title: 'Your templates', body: 'Edit or delete them. Staff already set up from a template keep their salary either way.' },
        ],
    },
    'payroll-template-form': {
        title: 'Salary template',
        steps: [
            { target: 'pay-template-name', title: 'Name', body: 'A name you will recognise when picking it, e.g. "Senior Teacher".' },
            { target: 'pay-salary-basic', title: 'Basic salary', body: 'Percentage lines are worked out from this.' },
            { target: 'pay-allowances', title: 'Allowances', body: 'Extra pay lines - fixed or a percentage of basic.' },
            { target: 'pay-deductions', title: 'Deductions', body: 'Lines taken off - fixed or a percentage of basic.' },
            { target: 'pay-net-preview', title: 'Net pay', body: 'What someone on this template takes home.' },
            { target: 'pay-save', title: 'Save', body: 'Use it next time you add a salary.' },
        ],
    },
    'payroll-runs': {
        title: 'Payroll runs',
        steps: [
            { title: 'Payroll runs', body: 'One run per pay period, e.g. "June 2026". Each goes Draft, then Generated, then Published.' },
            { target: 'pay-start-run', title: 'Start a run', body: 'Everyone active with a salary is added to it.' },
            { target: 'pay-run-list', title: 'Every run', body: 'Filter by status or period, and open a run to review, generate or publish it.' },
        ],
    },
    'payroll-run-new': {
        title: 'Start a payroll run',
        steps: [
            { target: 'pay-run-period', title: 'Period', body: 'The month this pays for, e.g. "June 2026". A period can only be paid once.' },
            { target: 'pay-run-paydate', title: 'Pay date', body: 'The day staff are paid. It prints on every payslip.' },
            { target: 'pay-run-create', title: 'Create', body: 'Creates a draft with everyone on it. Nothing is paid or recorded yet.' },
        ],
    },
    'payroll-run': {
        title: 'Payroll run',
        steps: [
            { target: 'pay-run-progress', title: 'Where it stands', body: 'Draft, then Generated, then Published.' },
            { target: 'pay-run-totals', title: 'Totals', body: 'People included and the gross, deductions and net. They follow the switches below.' },
            { target: 'pay-run-employees', title: 'Who is paid', body: 'In a draft, switch off anyone who shouldn\'t be paid this period. Open a row to see the payslip.' },
            { target: 'pay-run-generate', title: 'Generate', body: 'Locks the numbers and records the net total as an expense in the school ledger. It can\'t be undone.' },
            { target: 'pay-run-publish', title: 'Publish', body: 'Lets every included staff member see and download their payslip.' },
            { target: 'pay-run-delete', title: 'Delete a draft', body: 'Only a draft can be deleted - nothing has been paid yet.' },
        ],
    },
    'payroll-payslip': {
        title: 'Payslip',
        steps: [
            { target: 'pay-slip-document', title: 'The payslip', body: 'Earnings, deductions and net pay for the period.' },
            { target: 'pay-slip-print', title: 'Print', body: 'Print it on A4.' },
            { target: 'pay-slip-download', title: 'Download', body: 'Save it as a PDF.' },
            { target: 'pay-slip-design', title: 'Design', body: 'Change the colour, logo and footer used on every payslip.' },
        ],
    },
    'payroll-my-payslips': {
        title: 'My payslips',
        steps: [
            { title: 'My payslips', body: 'Your payslips appear here once the school publishes a payroll run you are on.' },
            { target: 'pay-my-latest', title: 'Latest payslip', body: 'Your most recent net pay. Open it to see the full payslip.' },
            { target: 'pay-my-list', title: 'All payslips', body: 'Every published payslip, newest first. Open one to print or download it.' },
        ],
    },
    'payroll-payslip-design': {
        title: 'Payslip design',
        steps: [
            { title: 'Payslip design', body: 'How payslips look for the whole school.' },
            { target: 'pay-design-sections', title: 'Sections', body: 'Show a faint logo watermark, and the net pay spelled out in words.' },
            { target: 'pay-design-theme', title: 'Theme', body: 'Accent colour, logo and a footer note.' },
            { target: 'pay-design-preview', title: 'Live preview', body: 'A sample payslip that updates as you change things.' },
            { target: 'pay-design-save', title: 'Save', body: 'Applies to every payslip, including past ones when they are opened again.' },
        ],
    },
    'accountant-classes': {
        title: 'Classes',
        steps: [
            { title: 'Classes and fees', body: 'How much each class owes and has paid, so you know where to follow up.' },
            { target: 'acc-class-stats', title: 'School totals', body: 'Classes, students, the fees expected and the average share collected.' },
            { target: 'acc-class-search', title: 'Find a class', body: 'Search by name, or filter by section, stream or level.' },
            { target: 'acc-view', title: 'Table or cards', body: 'Switch how the list is shown.' },
            { target: 'acc-class-list', title: 'Each class', body: 'Students, total fees, paid and balance, with a status: Paid, Partial, Pending or Overdue. Start with the biggest balances.' },
        ],
    },
    'accountant-parents': {
        title: 'Parents',
        steps: [
            { title: 'Parents and fees', body: 'What each parent owes for all their children together.' },
            { target: 'acc-parent-stats', title: 'Totals', body: 'Parents, children, the fees expected from them and what has been collected.' },
            { target: 'acc-parent-search', title: 'Find a parent', body: 'Search by name, email or phone, and sort the list.' },
            { target: 'acc-view', title: 'Table or cards', body: 'Switch how the list is shown.' },
            { target: 'acc-parent-list', title: 'Each parent', body: 'Number of children, total fees, paid and balance, with a status. Use it when a parent calls or comes in to pay.' },
        ],
    },
    'fin-report-revenue': {
        title: 'Revenue analysis',
        steps: [
            { title: 'Financial reports', body: 'See where the school\'s money comes from and goes. Start here with revenue.' },
            { target: 'fr-downloads', title: 'Download reports', body: 'Revenue by class, revenue by term, outstanding fees, and profit and loss - each saves as a spreadsheet (CSV).' },
            { target: 'fr-tabs', title: 'The reports', body: 'Revenue, outstanding fees, expenses, payment history, and profit and loss.' },
            { target: 'fr-revenue-class', title: 'Revenue by class', body: 'Fees paid, partly paid and unpaid in each class.' },
            { target: 'fr-revenue-trend', title: 'Month by month', body: 'Money in against money out each month.' },
        ],
    },
    'fin-report-outstanding': {
        title: 'Outstanding fees',
        steps: [
            { target: 'fr-downloads', title: 'Download reports', body: 'Revenue by class, revenue by term, outstanding fees, and profit and loss - each saves as a spreadsheet (CSV).' },
            { target: 'fr-tabs', title: 'The reports', body: 'Revenue, outstanding fees, expenses, payment history, and profit and loss.' },
            { target: 'fr-outstanding-chart', title: 'Who still owes', body: 'Unpaid and partly paid fees in each class. The tallest bars need following up first.' },
        ],
    },
    'fin-report-expense': {
        title: 'Expense report',
        steps: [
            { target: 'fr-downloads', title: 'Download reports', body: 'Revenue by class, revenue by term, outstanding fees, and profit and loss - each saves as a spreadsheet (CSV).' },
            { target: 'fr-tabs', title: 'The reports', body: 'Revenue, outstanding fees, expenses, payment history, and profit and loss.' },
            { target: 'fr-expense-chart', title: 'Spending by category', body: 'How much went on each expense category.' },
        ],
    },
    'fin-report-history': {
        title: 'Payment history',
        steps: [
            { target: 'fr-filters', title: 'Filter', body: 'Narrow the payments by date, method or other fields, then apply.' },
            { target: 'fr-downloads', title: 'Download reports', body: 'Revenue by class, revenue by term, outstanding fees, and profit and loss - each saves as a spreadsheet (CSV).' },
            { target: 'fr-tabs', title: 'The reports', body: 'Revenue, outstanding fees, expenses, payment history, and profit and loss.' },
            { target: 'fr-history-list', title: 'Every payment', body: 'Date, student, fee, term, amount, method and reference for each payment received.' },
        ],
    },
    'fin-report-profit-loss': {
        title: 'Profit & loss',
        steps: [
            { target: 'fr-downloads', title: 'Download reports', body: 'Revenue by class, revenue by term, outstanding fees, and profit and loss - each saves as a spreadsheet (CSV).' },
            { target: 'fr-tabs', title: 'The reports', body: 'Revenue, outstanding fees, expenses, payment history, and profit and loss.' },
            { target: 'fr-pl-totals', title: 'The bottom line', body: 'All money in, all money out, and what is left.' },
            { target: 'fr-pl-chart', title: 'By month', body: 'Revenue, expenses and profit for each month.' },
        ],
    },
    'admin-dashboard': {
        title: 'Dashboard',
        steps: [
            { title: 'Your school at a glance', body: 'The dashboard shows how the school is doing today. Here is a quick look around.' },
            { target: 'adm-dash-stats', title: 'Key numbers', body: 'Students, teachers, the active academic year and this month\'s revenue.' },
            { target: 'adm-dash-quick', title: 'Quick actions', body: 'Jump straight to adding a student, teacher, class or subject.' },
            { target: 'adm-dash-charts', title: 'Money and attendance', body: 'Where revenue comes from, and the attendance rate for each day this week.' },
            { target: 'adm-dash-attention', title: 'Needs attention', body: 'Classes where students have low attendance or are below the pass mark. Open one to see who.' },
            { target: 'adm-dash-staff', title: 'Staff attendance', body: 'Today\'s staff present, absent, late and excused.' },
            { target: 'adm-dash-calendar', title: 'Calendar and activity', body: 'Upcoming events and holidays, and the latest things done in the school.' },
            { target: 'adm-dash-class', title: 'Class performance', body: 'The average score in each class.' },
        ],
    },
    'admin-students': {
        title: 'Students',
        steps: [
            { title: 'Students', body: 'Every student in the school, with their class, guardian, attendance, average and fees.' },
            { target: 'adm-stu-add', title: 'Enrol a student', body: 'Add one student with their class and guardian.' },
            { target: 'adm-stu-import', title: 'Import many', body: 'Add a whole class at once from a spreadsheet.' },
            { target: 'adm-search', title: 'Find students', body: 'Search by name or admission number, and filter by class or gender.' },
            { target: 'list-view', title: 'Table or cards', body: 'Switch how the list is shown.' },
            { target: 'adm-list', title: 'Open a student', body: 'Open a student to see their profile, fees, attendance and results, or to change their class or guardian.' },
        ],
    },
    'admin-teachers': {
        title: 'Teachers & staff',
        steps: [
            { title: 'Teachers and staff', body: 'Everyone who works at the school - teachers and other staff such as the accountant or librarian.' },
            { target: 'adm-tch-add', title: 'Add a teacher', body: 'They get an account and can be given classes and subjects.' },
            { target: 'adm-tch-staff', title: 'Add other staff', body: 'Accountant, librarian, nurse, exam officer and other roles.' },
            { target: 'adm-search', title: 'Find someone', body: 'Search by name, staff ID, email or phone, and filter by gender.' },
            { target: 'list-view', title: 'Table or cards', body: 'Switch how the list is shown.' },
            { target: 'adm-list', title: 'Open a profile', body: 'See their details, classes and subjects, or deactivate them when they leave.' },
        ],
    },
    'admin-parents': {
        title: 'Parents',
        steps: [
            { title: 'Parents', body: 'Every parent or guardian linked to a student. Parents are added when you enrol a student.' },
            { target: 'adm-search', title: 'Find a parent', body: 'Search by name, email or phone, and sort the list.' },
            { target: 'list-view', title: 'Table or cards', body: 'Switch how the list is shown.' },
            { target: 'adm-list', title: 'Open a parent', body: 'See their children and contact details. A "No Email" badge means they can\'t sign in to the parent portal yet.' },
        ],
    },
    'admin-classes': {
        title: 'Classes',
        steps: [
            { title: 'Classes', body: 'The classes in the school, who teaches them, how many students and their fees.' },
            { target: 'adm-class-tabs', title: 'Classes, sections and streams', body: 'Sections group classes (e.g. Primary, JSS, SSS); streams split senior classes (e.g. Science, Arts).' },
            { target: 'adm-class-add', title: 'Add a class', body: 'Create a class in a section, and a stream if it has one.' },
            { target: 'adm-class-master', title: 'Class master', body: 'Pick the class teacher. They mark attendance, approve report cards and can approve grades.' },
            { target: 'adm-search', title: 'Find a class', body: 'Search, or filter by section, stream or level.' },
            { target: 'adm-class-order', title: 'Arrange', body: 'Put the classes in order. Lists and reports follow this order.' },
            { target: 'adm-list', title: 'Open a class', body: 'See its students, subjects, attendance and performance. A warning sign means some students need attention.' },
        ],
    },
    'admin-report-cards': {
        title: 'Report Cards',
        steps: [
            { title: 'Report cards', body: 'Admins generate them, each class teacher checks, comments and approves them, and then parents can see them.' },
            { target: 'rc-generate', title: 'Generate', body: 'Build a class\'s report cards for a term from its grades.' },
            { target: 'rc-design', title: 'Design', body: 'Choose the template, logo, colours and what the cards show.' },
            { target: 'rc-stats', title: 'At a glance', body: 'Cards generated, passed and needing attention, and the average.' },
            { target: 'rc-filters', title: 'Choose a class and term', body: 'Search a student, or filter by term, class, section or stream.' },
            { target: 'report-review', title: 'Review status', body: 'For the chosen class: how many cards wait for the class teacher, were sent back, or are approved - and the teacher\'s note if sent back.' },
            { target: 'report-list', title: 'Every card', body: 'Open a card to preview, print or download it.' },
        ],
    },
    'admin-leave': {
        title: 'Leave management',
        steps: [
            { title: 'Leave management', body: 'Staff leave requests in one place. Approve or reject them, and see who is away.' },
            { target: 'leave-stats', title: 'At a glance', body: 'All requests, and how many are pending, approved or rejected.' },
            { target: 'leave-filters', title: 'Find requests', body: 'Search a staff member, or filter by status and leave type.' },
            { target: 'leave-list', title: 'Requests', body: 'Open a request with View to read it and approve or reject it.' },
            { target: 'leave-new', title: 'Your own leave', body: 'Request leave for yourself here too.' },
        ],
    },
    'admin-grade-entry': {
        title: 'Grade Entry',
        steps: [
            { title: 'Grade Entry', body: 'Enter or correct scores for any class and subject - for example when a teacher is away.' },
            { target: 'grades-tabs', title: 'Grades & Exams', body: 'Submissions, approval, the exam timetable and the broadsheet are in these tabs.' },
            { target: 'grades-pick', title: 'Term, class and subject', body: 'Pick the term, the class and the subject (with its teacher).' },
            { target: 'grades-returned', title: 'Returned grades', body: 'Assessments sent back by an approver, with their note.' },
            { target: 'grades-continuous', title: 'Continuous assessment', body: 'Assessments run as CA + a formal test are recorded on their own page - open them from here.' },
            { target: 'grades-table', title: 'Enter scores', body: 'Type each student\'s score. Locked assessments are read-only.' },
            { target: 'grades-actions', title: 'Save, then complete', body: 'Save keeps a draft. Complete Assessment sends it for approval.' },
        ],
    },
    'admin-academic-years': {
        title: 'Academic years',
        steps: [
            { title: 'Academic years', body: 'Each school year, e.g. 2026/2027. Everything - terms, classes, fees and results - belongs to a year.' },
            { target: 'adm-acad-tabs', title: 'The academic setup', body: 'Years, terms, assessment templates, the assessment cycle, the grade scale and promotions.' },
            { target: 'acad-add', title: 'Add a year', body: 'Give it a name and its start and end dates.' },
            { target: 'acad-next', title: 'Set the next year', body: 'Say which year follows the current one, so promotions can move students into it.' },
            { target: 'adm-filters', title: 'Filter', body: 'By status, current year, or name.' },
            { target: 'adm-list', title: 'Years', body: 'Edit or delete a year. The active one is marked Current.' },
        ],
    },
    'admin-terms': {
        title: 'Terms',
        steps: [
            { title: 'Terms', body: 'The terms of each academic year. Attendance, assessments and fees are kept term by term.' },
            { target: 'acad-term-add', title: 'Add a term', body: 'Pick the year, name it (e.g. First Term) and set its dates.' },
            { target: 'adm-filters', title: 'Filter', body: 'By status or name.' },
            { target: 'adm-list', title: 'Terms', body: 'Edit a term\'s dates or status, or delete it.' },
        ],
    },
    'admin-assessment-templates': {
        title: 'Assessment templates',
        steps: [
            { title: 'Assessment templates', body: 'A template says which tests a class sits each term, what each is worth, and how it is scored. Each class uses one.' },
            { target: 'acad-tpl-add', title: 'Add a template', body: 'A short wizard: name and pass mark, the tests and their weights, then scoring.' },
            { target: 'adm-search', title: 'Find one', body: 'Search, or filter by status and scoring type (standard or continuous assessment).' },
            { target: 'adm-list', title: 'Templates', body: 'Weights must add up to 100%. Open one to view it, or use the menu to edit or delete it.' },
        ],
    },
    'admin-assessment-cycle': {
        title: 'Assessment cycle',
        steps: [
            { title: 'Assessment cycle', body: 'Which assessment (1st Test, Exam...) the school is on, and moving everyone to the next one.' },
            { target: 'cycle-stats', title: 'Where things stand', body: 'The active term, the template in use and how many classes are ready to move on.' },
            { target: 'cycle-classes', title: 'Classes', body: 'Each class and whether it is ready - a class that isn\'t says why.' },
            { target: 'cycle-detail', title: 'A class\'s stages', body: 'The stages of the selected class and how far each has got.' },
            { target: 'cycle-section', title: 'One section at a time', body: 'If sections run their assessments separately, pick the section to move.' },
            { target: 'cycle-advance', title: 'Move to the next assessment', body: 'Opens the next assessment for grade entry. Check the classes are ready first.' },
        ],
    },
    'admin-assessment-check': {
        title: 'Assessment check',
        steps: [
            { title: 'Assessment check', body: 'Makes sure every student has the assessments their class\'s template gives them, so grade entry works.' },
            { target: 'check-stats', title: 'Summary', body: 'How many classes are fine and how many have a problem.' },
            { target: 'check-tabs', title: 'Show', body: 'Switch between classes with problems and all classes.' },
            { target: 'adm-list', title: 'Each class', body: 'What is wrong and a button to fix it - create missing assessments, set a template, add subjects or assign teachers.' },
            { target: 'check-fix-all', title: 'Fix them all', body: 'Creates the missing assessments for every class that can be fixed automatically.' },
        ],
    },
    'admin-grade-scale': {
        title: 'Grade scale',
        steps: [
            { title: 'Grade scale', body: 'Turns scores into grades, e.g. 75-100 is A1. Used on report cards and for positions.' },
            { target: 'scale-bands', title: 'Bands', body: 'Each band has a top score, a bottom score and its grade. Bands shouldn\'t overlap or leave gaps.' },
            { target: 'scale-add', title: 'Add a band', body: 'Add another grade.' },
            { target: 'scale-save', title: 'Save', body: 'Report cards generated after this use the new scale.' },
        ],
    },
    'admin-promotions': {
        title: 'Promotions',
        steps: [
            { title: 'Promotions', body: 'At the end of the year, class masters say who moves up, repeats or leaves. You review it and close the year.' },
            { target: 'promo-start', title: 'Start a promotion', body: 'Promotions are started from a class.' },
            { target: 'promo-progress', title: 'Year progress', body: 'How many classes are promoted, and anything blocking the year from closing.' },
            { target: 'promo-close', title: 'Close the year', body: 'When every class is done and the next year is set, close this year and make the next one active.' },
            { target: 'promo-rules', title: 'Promotion rules', body: 'The pass mark, how often a student may repeat, and whether submissions need approval.' },
            { target: 'adm-list', title: 'Requests', body: 'What each class master submitted. Open one to review and approve it.' },
        ],
    },
    'admin-template-setup': {
        title: 'Template setup',
        steps: [
            { target: 'tpl-steps', title: 'Step by step', body: 'Details, then the tests and their weights, then how each is scored. You can go back to any step.' },
            { target: 'tpl-form', title: 'Fill it in', body: 'Start from a common school setup or build your own. The weights in each term must add up to 100%.' },
        ],
    },
    'admin-subjects': {
        title: 'Subjects',
        steps: [
            { title: 'Subjects', body: 'Every subject the school teaches. Set them up once, then give them to classes and teachers.' },
            { target: 'subj-tabs', title: 'The subject setup', body: 'Subjects, then who teaches them, optional-subject groups, and which classes take which subjects.' },
            { target: 'subj-add', title: 'Add a subject', body: 'Give it a name and a short code, e.g. Mathematics - MTH.' },
            { target: 'adm-search', title: 'Find one', body: 'Search by name or code.' },
            { target: 'adm-list', title: 'Subjects', body: 'Use the menu on a subject to edit or delete it.' },
        ],
    },
    'admin-teacher-assignment': {
        title: 'Teacher assignment',
        steps: [
            { title: 'Who teaches what', body: 'Links a teacher to a subject in a class. The teacher then enters that subject\'s grades.' },
            { target: 'ta-assign', title: 'Assign a subject', body: 'Pick the teacher, the class and the subjects they teach there.' },
            { target: 'adm-search', title: 'Find an assignment', body: 'Search by teacher or subject, or filter by class.' },
            { target: 'adm-list', title: 'Assignments', body: 'Every teacher-subject-class link and when it was made.' },
        ],
    },
    'admin-subject-groups': {
        title: 'Subject groups',
        steps: [
            { title: 'Subject groups', body: 'A set of optional subjects where a student picks some, e.g. pick 1 of French, Arabic or Computing.' },
            { target: 'subj-group-add', title: 'Add a group', body: 'Name it, pick the level, class and stream, and how many subjects a student chooses.' },
            { target: 'adm-search', title: 'Find a group', body: 'Search by name, or filter by class.' },
            { target: 'adm-list', title: 'Groups', body: 'Use the menu to edit or delete a group.' },
        ],
    },
    'admin-class-subjects': {
        title: 'Class subjects',
        steps: [
            { title: 'Class subjects', body: 'Which subjects each class takes, and whether each is core or optional.' },
            { target: 'cs-assign', title: 'Assign subjects', body: 'Pick a class and add its subjects.' },
            { target: 'cs-duplicate', title: 'Copy to other classes', body: 'Give other classes the same subject list in one go - it replaces their current list.' },
            { target: 'adm-search', title: 'Find', body: 'Search by class, subject or stream, or filter.' },
            { target: 'adm-list', title: 'The list', body: 'Each class subject, marked Core or Optional. Subjects with grades are locked.' },
        ],
    },
    'admin-sections': {
        title: 'Sections',
        steps: [
            { title: 'Sections', body: 'Sections group classes, e.g. Nursery, Primary, JSS and SSS. Many settings - fees, approvals, libraries - work per section.' },
            { target: 'adm-class-tabs', title: 'Classes, sections and streams', body: 'Switch between the three here.' },
            { target: 'sec-add', title: 'Add a section', body: 'Create a section before adding its classes.' },
            { target: 'sec-order', title: 'Arrange', body: 'Put sections in order, youngest first.' },
            { target: 'adm-search', title: 'Find', body: 'Search by name.' },
            { target: 'adm-list', title: 'Sections', body: 'Edit or delete a section.' },
        ],
    },
    'admin-streams': {
        title: 'Streams',
        steps: [
            { title: 'Streams', body: 'Streams split senior classes by subject area, e.g. Science, Arts and Commercial.' },
            { target: 'stream-add', title: 'Add a stream', body: 'Name the stream. Classes at a streamed level then pick one.' },
            { target: 'adm-search', title: 'Find', body: 'Search by name.' },
            { target: 'adm-list', title: 'Streams', body: 'Edit or delete a stream.' },
        ],
    },
    'admin-attendance': {
        title: 'Mark Attendance',
        steps: [
            { title: 'Attendance', body: 'Take the register for any class, and see the school\'s attendance today.' },
            { target: 'att-summary', title: 'Today', body: 'Students present, absent, late and excused across the school.' },
            { target: 'att-pick', title: 'Class and date', body: 'Pick the class and the day. Past days can be corrected.' },
            { target: 'att-roll', title: 'Roll call', body: 'If the school takes two roll calls a day, pick which one this is.' },
            { target: 'att-actions', title: 'Quick marking', body: 'Mark everyone present, clear all, or mark a holiday.' },
            { target: 'att-list', title: 'Each student', body: 'Tick Present, Late or Excused. Give a reason for Excused. Unticked means absent.' },
            { target: 'att-save', title: 'Save', body: 'Saves the register. Parents of absent students are alerted.' },
            { target: 'att-history', title: 'History', body: 'Registers already taken.' },
        ],
    },
    'admin-daily-register': {
        title: 'Daily Register',
        steps: [
            { target: 'rep-filters', title: 'Choose', body: 'Pick the term, the date and the class.' },
            { target: 'rep-preview', title: 'The register', body: 'Every student\'s mark for that day, laid out for printing.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF to print or file.' },
        ],
    },
    'admin-monthly-summary': {
        title: 'Monthly Summary',
        steps: [
            { target: 'rep-filters', title: 'Choose', body: 'Pick the term, the month and the class.' },
            { target: 'rep-preview', title: 'The summary', body: 'Each student\'s days present, absent and late in the month, and their rate.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-term-summary': {
        title: 'Term Summary',
        steps: [
            { target: 'rep-filters', title: 'Choose', body: 'Pick the term and the class.' },
            { target: 'rep-preview', title: 'The summary', body: 'Each student\'s attendance over the whole term.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-class-summary': {
        title: 'Class Summary',
        steps: [
            { title: 'Class Summary', body: 'Compare attendance across every class at once.' },
            { target: 'rep-term', title: 'Term', body: 'Pick a term, or leave it on All Terms.' },
            { target: 'rep-preview', title: 'By class', body: 'Each class\'s attendance rate - spot the classes falling behind.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-inspection-reports': {
        title: 'Inspection Reports',
        steps: [
            { title: 'Inspection reports', body: 'Ready-made attendance reports for inspectors and the Ministry.' },
            { target: 'insp-form', title: 'Choose a report', body: 'Daily register, monthly or term summary, or attendance by gender (Ministry return). Then pick the class and period.' },
            { target: 'insp-generate', title: 'Generate', body: 'Builds the report. Preview it below, then print or download it.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
        ],
    },
    'admin-gender-attendance': {
        title: 'Attendance by Gender',
        steps: [
            { title: 'Attendance by gender', body: 'Boys\' and girls\' attendance - often asked for by the Ministry and partners.' },
            { target: 'gen-filters', title: 'Period and class', body: 'Week, month, term or year, and filter by level or class.' },
            { target: 'gen-stats', title: 'Totals', body: 'Boys and girls present, and each one\'s attendance rate.' },
        ],
    },
    'admin-marking-compliance': {
        title: 'Marking Compliance',
        steps: [
            { title: 'Marking compliance', body: 'Which classes have their registers taken every school day - and which don\'t.' },
            { target: 'mc-filters', title: 'Filters', body: 'Pick the term and a threshold, and show only classes below it.' },
            { target: 'mc-stats', title: 'Summary', body: 'School days so far, classes fully marked, classes below the threshold and the overall rate.' },
            { target: 'mc-list', title: 'Each class', body: 'How many days were marked, and the days missed. Follow up with the class master.' },
        ],
    },
    'admin-hr': {
        title: 'Human Resource',
        steps: [
            { title: 'Human Resource', body: 'Staff attendance and leave in one place.' },
            { target: 'hr-tabs', title: 'HR sections', body: 'Mark staff attendance, registers and summaries, reports, clock in and leave.' },
            { target: 'hr-leave-stats', title: 'Leave at a glance', body: 'All leave requests, and how many are pending, approved or rejected.' },
            { target: 'hr-quick', title: 'Quick actions', body: 'Jump to staff attendance, clock in or leave requests.' },
            { target: 'hr-trend', title: 'Attendance trend', body: 'How staff attendance has moved over recent days.' },
            { target: 'hr-today', title: 'Today', body: 'Staff present, absent, late and excused today.' },
            { target: 'hr-recent', title: 'Recent leave', body: 'The latest requests. Open one to approve or reject it.' },
        ],
    },
    'admin-staff-attendance': {
        title: 'Staff attendance',
        steps: [
            { title: 'Staff attendance', body: 'Who is in today. Staff clock themselves in, or you mark them here.' },
            { target: 'sa-date', title: 'Date', body: 'Today, or a past day to correct it.' },
            { target: 'sa-stats', title: 'Summary', body: 'Present, absent, late, excused and the rate for the day.' },
            { target: 'sa-register', title: 'The register', body: 'Clock someone in or out, or undo it. For past days, set their status from the menu.' },
            { target: 'sa-save', title: 'Save', body: 'Saves the statuses you changed.' },
            { target: 'sa-location', title: 'Location settings', body: 'Limit clock-in to the school grounds (a location and radius) or to the school\'s internet (IP addresses).' },
            { target: 'sa-history', title: 'History', body: 'Earlier days\' attendance.' },
        ],
    },
    'admin-staff-daily-register': {
        title: 'Staff Daily Register',
        steps: [
            { target: 'rep-filters', title: 'Choose', body: 'Pick the date, and a teacher if you want just one.' },
            { target: 'rep-preview', title: 'The register', body: 'Each staff member\'s status and clock times for the day.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-staff-monthly-summary': {
        title: 'Staff Monthly Summary',
        steps: [
            { target: 'rep-filters', title: 'Choose', body: 'Pick the month, and a teacher if you want just one.' },
            { target: 'rep-preview', title: 'The summary', body: 'Days present, absent and late for each staff member.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-staff-term-summary': {
        title: 'Staff Term Summary',
        steps: [
            { target: 'rep-filters', title: 'Choose', body: 'Pick the term, and a teacher if you want just one.' },
            { target: 'rep-preview', title: 'The summary', body: 'Each staff member\'s attendance over the term.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-staff-management-reports': {
        title: 'Management Reports',
        steps: [
            { title: 'Management reports', body: 'Staff attendance documents for school management.' },
            { target: 'insp-form', title: 'Choose a report', body: 'Daily register, monthly or term summary, and the period.' },
            { target: 'insp-generate', title: 'Generate', body: 'Builds the report. Preview it, then print or download.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
        ],
    },
    'student-enrol-student': {
        title: 'Enrolment: student',
        steps: [
            { title: 'Enrolling a student', body: 'Four short steps: the student, their guardian, their class, then a photo. Your progress is saved on this device as you go.' },
            { target: 'enrol-steps', title: 'The steps', body: 'You can go back to a finished step by tapping it.' },
            { target: 'enrol-name', title: 'Name', body: 'The student\'s given names and family name, as they should print on report cards.' },
            { target: 'enrol-dob', title: 'Date of birth', body: 'Used for age on records and reports.' },
            { target: 'enrol-gender', title: 'Gender and background', body: 'Gender, nationality and religion. Gender is used in the Ministry attendance returns.' },
            { target: 'enrol-address', title: 'Address', body: 'Where the student lives.' },
            { target: 'enrol-next', title: 'Continue', body: 'Checks this step and moves to the guardian.' },
        ],
    },
    'student-enrol-guardian': {
        title: 'Enrolment: guardian',
        steps: [
            { target: 'enrol-parents', title: 'Parents', body: 'The father\'s and mother\'s names, jobs and phone numbers.' },
            { target: 'enrol-guardian-mode', title: 'Guardian', body: 'The guardian is the person the school deals with. Pick an existing one (for a brother or sister already here) or add a new one.' },
            { target: 'enrol-guardian', title: 'Guardian details', body: 'Choose the relationship. For Father or Mother, their details are copied from above.' },
            { target: 'enrol-guardian-email', title: 'Email', body: 'Optional, but with an email the guardian can use the parent portal and get alerts.' },
            { target: 'enrol-next', title: 'Continue', body: 'On to the class.' },
        ],
    },
    'student-enrol-academic': {
        title: 'Enrolment: class',
        steps: [
            { target: 'enrol-type', title: 'Enrolment type', body: 'New, transfer from another school, re-enrolled, or an existing student being added to the system.' },
            { target: 'enrol-date', title: 'Admission date', body: 'The day the student joined.' },
            { target: 'enrol-class', title: 'Class', body: 'The class they join this academic year.' },
            { target: 'enrol-id', title: 'Student ID', body: 'Their admission number.' },
            { target: 'enrol-transfer', title: 'Transfers', body: 'For a transfer, the previous school and the last grade completed are required.' },
            { target: 'enrol-subjects', title: 'Subjects', body: 'Core subjects are fixed. Where the class has optional groups, pick the student\'s choices.' },
            { target: 'enrol-next', title: 'Continue', body: 'On to the photo.' },
        ],
    },
    'student-enrol-photo': {
        title: 'Enrolment: photo',
        steps: [
            { target: 'enrol-photo', title: 'Photo', body: 'Optional. Upload a photo and crop it - it goes on the ID card and report card. You can add it later.' },
            { target: 'enrol-photo-tips', title: 'A good photo', body: 'Front-facing, clear and well lit.' },
            { target: 'enrol-next', title: 'Enrol', body: 'Creates the student, links the guardian and adds the fees for their class.' },
        ],
    },
    'admin-behaviours': {
        title: 'Behaviours',
        steps: [
            { title: 'Behaviours', body: 'Notes teachers record about students\' conduct - good, bad or neutral.' },
            { target: 'beh-tabs', title: 'Behaviours and categories', body: 'Categories are the kinds of behaviour teachers pick from.' },
            { target: 'beh-stats', title: 'Totals', body: 'Positive, negative and neutral notes.' },
            { target: 'beh-list', title: 'Notes', body: 'Pick a class to see its notes - the student, the behaviour, who recorded it and when.' },
        ],
    },
    'admin-behaviour-categories': {
        title: 'Behaviour categories',
        steps: [
            { title: 'Categories', body: 'The kinds of behaviour teachers record, e.g. Helping others (positive) or Lateness (negative).' },
            { target: 'beh-cat-add', title: 'Add a category', body: 'Name it, say whether it is positive, negative or neutral, and describe it.' },
            { target: 'adm-list', title: 'Categories', body: 'Edit or delete a category from its menu.' },
        ],
    },
    'curriculum-schemes': {
        title: 'Scheme of Work',
        steps: [
            { title: 'Scheme of work', body: 'What each subject covers, week by week, and how far teachers have got.' },
            { target: 'cur-tabs', title: 'Curriculum', body: 'Schemes of work and teacher progress.' },
            { target: 'cur-actions', title: 'Quick actions', body: 'Create a scheme, upload many at once, or open teacher progress.' },
            { target: 'cur-mine', title: 'Your progress', body: 'How much of your schemes you have covered.' },
            { target: 'cur-coverage', title: 'Coverage', body: 'Average coverage across teachers, and who is behind.' },
            { target: 'cur-schemes', title: 'Schemes', body: 'Open a scheme to see its weeks and lessons, and tick off what is taught.' },
        ],
    },
    'admin-teacher-progress': {
        title: 'Teacher progress',
        steps: [
            { title: 'Teacher progress', body: 'How far each teacher has got through their scheme of work.' },
            { target: 'tp-filters', title: 'Find', body: 'Search a teacher, or filter by status.' },
            { target: 'tp-stats', title: 'Overview', body: 'Teachers, lessons completed and remaining, and the average coverage.' },
            { target: 'tp-list', title: 'Each teacher', body: 'Their coverage. Open one to see subject by subject.' },
        ],
    },
    'admin-timetable': {
        title: 'Class timetables',
        steps: [
            { title: 'Class timetables', body: 'Build each class\'s weekly timetable.' },
            { target: 'tt-tabs', title: 'Timetable', body: 'The timetable, its settings (times, days, rooms) and the PDF design.' },
            { target: 'tt-class', title: 'Pick a class', body: 'Choose the class to build or view.' },
            { target: 'tt-grid', title: 'The week', body: 'Each row is a period. Tap a slot to put a subject and teacher in it - a subject can span two periods.' },
            { target: 'tt-add-period', title: 'Add a period', body: 'Add a lesson period with its times.' },
            { target: 'tt-add-break', title: 'Break and lunch', body: 'Add a break or lunch - no lessons go in them.' },
            { target: 'tt-add-assembly', title: 'Assembly', body: 'Add assembly time.' },
            { target: 'tt-download', title: 'Download', body: 'Save the class timetable as a PDF.' },
        ],
    },
    'admin-timetable-settings': {
        title: 'Timetable settings',
        steps: [
            { title: 'Timetable settings', body: 'Set these up before building timetables.' },
            { target: 'tts-timing', title: 'Timing templates', body: 'The school day\'s schedule - when it starts and how long periods are. Different sections can use different ones.' },
            { target: 'tts-days', title: 'Working days', body: 'Which days classes are held, for each timing template.' },
            { target: 'tts-rooms', title: 'Rooms', body: 'Classrooms and other spaces, so lessons can be given a room.' },
        ],
    },
    'admin-timetable-design': {
        title: 'Timetable design',
        steps: [
            { title: 'Timetable design', body: 'How the timetable PDF looks when admins, teachers and parents download it.' },
            { target: 'ttd-style', title: 'Style', body: 'Title, colour, page orientation and a footer note.' },
            { target: 'ttd-show', title: 'What to show', body: 'Logo, icons, period times, teacher names and rooms.' },
            { target: 'ttd-preview', title: 'Preview', body: 'Pick a class to see its timetable exactly as it will download.' },
            { target: 'ttd-save', title: 'Save', body: 'Applies to every timetable download.' },
        ],
    },
    'comm-notices': {
        title: 'Notice board',
        steps: [
            { title: 'Notice board', body: 'School notices for staff, parents and students. Pinned notices stay at the top.' },
            { target: 'comm-tabs', title: 'Communicate', body: 'Notices, events and holidays, your notifications, and broadcasts.' },
            { target: 'comm-add', title: 'Post a notice', body: 'Write a notice for the whole school or one section.' },
            { target: 'adm-search', title: 'Find a notice', body: 'Search, or filter by category.' },
            { target: 'adm-list', title: 'Notices', body: 'The newest first. Managers can pin, edit or delete them.' },
        ],
    },
    'comm-events': {
        title: 'Events & holidays',
        steps: [
            { title: 'Events & holidays', body: 'The school calendar - events, holidays and closures.' },
            { target: 'comm-add', title: 'Add an event', body: 'Give it a date, type and the section it applies to.' },
            { target: 'adm-search', title: 'Find', body: 'Search events.' },
            { target: 'comm-filter', title: 'Type', body: 'Show only events or only holidays.' },
            { target: 'adm-list', title: 'Calendar', body: 'Every event with its dates and section.' },
        ],
    },
    'comm-notifications': {
        title: 'Notifications',
        steps: [
            { title: 'Your notifications', body: 'Everything the system has told you - approvals, reminders, alerts and broadcasts.' },
            { target: 'adm-search', title: 'Find one', body: 'Search your notifications.' },
            { target: 'comm-filter', title: 'Filter', body: 'Show all, or only unread ones.' },
            { target: 'adm-list', title: 'List', body: 'Tap one to read it in full.' },
        ],
    },
    'admin-broadcast': {
        title: 'Compose broadcast',
        steps: [
            { title: 'Broadcast', body: 'Send one message to many people at once - by SMS, email, push or in the app.' },
            { target: 'bc-title', title: 'Title', body: 'A short subject line.' },
            { target: 'bc-message', title: 'Message', body: 'What you want to say. Keep SMS short.' },
            { target: 'bc-section', title: 'Whole school or a section', body: 'Send to everyone, or only one section, e.g. Primary.' },
            { target: 'bc-audience', title: 'Audience', body: 'Students, parents, teachers or staff.' },
            { target: 'bc-channels', title: 'Channels', body: 'How it is delivered - SMS, Email, Push or In-App. Pick one or more.' },
            { target: 'bc-when', title: 'Now or later', body: 'Send now, or schedule it for a date and time.' },
            { target: 'bc-reach', title: 'Reach', body: 'How many people will receive it.' },
            { target: 'bc-send', title: 'Send', body: 'Sends or schedules it. Follow it in Broadcast History.' },
        ],
    },
    'admin-broadcast-history': {
        title: 'Broadcast history',
        steps: [
            { title: 'Broadcast history', body: 'Every broadcast sent or scheduled, and how it went.' },
            { target: 'adm-search', title: 'Find', body: 'Search, or filter by status.' },
            { target: 'bc-compose', title: 'New broadcast', body: 'Write another message.' },
            { target: 'adm-list', title: 'Broadcasts', body: 'Each one with its audience, channels and status.' },
        ],
    },
    'admin-id-cards': {
        title: 'ID Cards',
        steps: [
            { title: 'ID cards', body: 'Print ID cards for students and staff.' },
            { target: 'idc-type', title: 'Students or staff', body: 'Switch between student cards and staff cards.' },
            { target: 'adm-search', title: 'Find someone', body: 'Search by name, or filter by class or gender.' },
            { target: 'idc-design', title: 'Card design', body: 'Change the colours, layout and what the card shows.' },
            { target: 'adm-list', title: 'Cards', body: 'Open a card to preview, print or download it.' },
        ],
    },
    'admin-id-card-design': {
        title: 'ID card design',
        steps: [
            { target: 'idc-type', title: 'Students or staff', body: 'Each has its own design.' },
            { target: 'idc-settings', title: 'Settings', body: 'Colours, layout and which details appear on the card.' },
            { target: 'idc-preview', title: 'Live preview', body: 'A sample card that updates as you change things. Save when happy.' },
        ],
    },
    'admin-report-generate': {
        title: 'Generate report cards',
        steps: [
            { title: 'Generate report cards', body: 'Build report cards for every student in a class from the grades entered.' },
            { target: 'rcg-form', title: 'Class and term', body: 'Pick the class (and stream or section) and the term.' },
            { target: 'rcg-scope', title: 'What it covers', body: 'The whole term (normal), only chosen assessments (e.g. a mid-term report), or every term of the year.' },
            { target: 'rcg-options', title: 'Options', body: 'Include attendance and class ranking on the cards.' },
            { target: 'rcg-recap', title: 'Check', body: 'A summary of what will be generated.' },
            { target: 'rcg-generate', title: 'Generate', body: 'Creates the cards and tells the class teacher to review and approve them.' },
        ],
    },
    'admin-report-design': {
        title: 'Report card design',
        steps: [
            { title: 'Report card design', body: 'How report cards look for the whole school.' },
            { target: 'rcd-sections', title: 'Sections', body: 'Choose what appears on the card.' },
            { target: 'rcd-remarks', title: 'Remarks by score', body: 'Automatic remarks for score ranges, e.g. 75-100: Excellent. Use the suggested set to start.' },
            { target: 'rcd-style', title: 'Style', body: 'Header colour, logo and a footer note.' },
            { target: 'rcd-preview', title: 'Preview', body: 'A sample card that updates as you change things.' },
            { target: 'rcd-save', title: 'Save', body: 'Applies to report cards from now on.' },
        ],
    },
    'admin-academic-reports': {
        title: 'Academic reports',
        steps: [
            { title: 'Academic reports', body: 'How students are doing - by class, subject and student - for a term.' },
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { target: 'ar-stats', title: 'Overview', body: 'Students assessed, assessments approved, the average, pass rate and how many need support.' },
            { target: 'ar-insights', title: 'What needs attention', body: 'The weakest class and subject, students at risk and missing results. Tap a card to open that report.' },
        ],
    },
    'admin-analytics': {
        title: 'Reports',
        steps: [
            { title: 'Reports', body: 'Build your own reports from school data and keep the useful ones.' },
            { target: 'an-new', title: 'New report', body: 'Pick the data, filters and chart in the report builder.' },
            { target: 'an-saved', title: 'Saved reports', body: 'Reports you kept, to run again.' },
            { target: 'an-tabs', title: 'Sections', body: 'Reports, the builder, saved reports and dashboard widgets.' },
            { target: 'an-stats', title: 'At a glance', body: 'Your reports and widgets so far.' },
        ],
    },
    'admin-demographics': {
        title: 'Demographics',
        steps: [
            { target: 'dem-filters', title: 'Who', body: 'The whole school, or a class or level.' },
            { target: 'rep-preview', title: 'Breakdown', body: 'Students by gender and religion, laid out for management reports.' },
            { target: 'rep-download', title: 'Print or download', body: 'Save it as a PDF.' },
        ],
    },
    'admin-academic-classes': {
        title: 'Academic reports: Classes',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'Classes', body: 'Each class\'s students enrolled and assessed, average and pass rate. Weak classes stand out.' },
        ],
    },
    'admin-academic-subjects': {
        title: 'Academic reports: Subjects',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'Subjects', body: 'Each subject\'s average, median, highest, lowest and pass rate. Open a subject for its breakdown.' },
        ],
    },
    'admin-academic-students': {
        title: 'Academic reports: Students',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'Students', body: 'Every student\'s overall average and how many assessments they sat.' },
        ],
    },
    'admin-academic-attention': {
        title: 'Academic reports: Attention',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'Attention', body: 'Students below the pass mark or with low attendance, so you can act early.' },
        ],
    },
    'admin-academic-continuous': {
        title: 'Academic reports: CA + Test',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'CA + Test', body: 'For continuous assessment: how classwork compares with the test, and students worth a look.' },
        ],
    },
    'admin-academic-completion': {
        title: 'Academic reports: Completion',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'Completion', body: 'Which assessments are still not submitted or approved, by class and subject.' },
        ],
    },
    'admin-academic-trends': {
        title: 'Academic reports: Trends',
        steps: [
            { target: 'ar-filters', title: 'Filters', body: 'Pick the term, and narrow to a level, class or subject.' },
            { target: 'ar-tabs', title: 'Reports', body: 'Overview, classes, subjects, students, attention, CA + test, completion and trends.' },
            { title: 'Trends', body: 'How averages move from one assessment and term to the next.' },
        ],
    },
    'admin-athletic': {
        title: 'Athletic houses',
        steps: [
            { title: 'Athletic houses', body: 'Put students into sports houses, class by class - by hand or at random.' },
            { target: 'ath-tabs', title: 'Management and houses', body: 'Set up the houses first, then place students.' },
            { target: 'ath-summary', title: 'House placement', body: 'How many students each house has.' },
            { target: 'ath-class', title: 'Pick a class', body: 'Choose the class to place.' },
            { target: 'ath-students', title: 'Students', body: 'Pick a house for each student.' },
            { target: 'ath-random', title: 'Randomly arrange', body: 'Spreads the class evenly across the houses and saves straight away.' },
            { target: 'ath-save', title: 'Save', body: 'Saves the houses you picked by hand.' },
        ],
    },
    'admin-houses': {
        title: 'Houses',
        steps: [
            { title: 'Houses', body: 'The school\'s sports houses, with their colours, mottos and house masters.' },
            { target: 'ath-house-add', title: 'Add a house', body: 'Name it, give it a colour and motto, and pick its house masters.' },
            { target: 'adm-list', title: 'Houses', body: 'Edit or delete a house from its menu.' },
        ],
    },
    'admin-users': {
        title: 'Users',
        steps: [
            { title: 'Users', body: 'Everyone who can sign in to the school - staff and parents - and their roles.' },
            { target: 'auth-tabs', title: 'Access', body: 'Users, the audit log of what was done, and active sign-in sessions.' },
            { target: 'auth-add', title: 'Add a user', body: 'Give someone an account and a role.' },
            { target: 'adm-search', title: 'Find a user', body: 'Search by name or email, or filter by role or status.' },
            { target: 'adm-list', title: 'Users', body: 'Open a user to change their roles, reset their access or deactivate them.' },
        ],
    },
    'admin-audits': {
        title: 'Audit log',
        steps: [
            { title: 'Audit log', body: 'A record of important actions - who did what, when and from where.' },
            { target: 'adm-search', title: 'Find', body: 'Search by action, user, email or IP address, or filter.' },
            { target: 'adm-list', title: 'Entries', body: 'Each action with its user, time and result.' },
        ],
    },
    'admin-sessions': {
        title: 'Sessions',
        steps: [
            { title: 'Sessions', body: 'Where people are signed in right now - device, IP and time.' },
            { target: 'adm-search', title: 'Find', body: 'Search by user, email, IP or device, or filter.' },
            { target: 'adm-list', title: 'Sessions', body: 'Log out a session you don\'t recognise from its menu.' },
        ],
    },
    'admin-modules': {
        title: 'Modules',
        steps: [
            { title: 'Modules', body: 'Turn school features on or off - library, health care, materials and more. Only installed modules show in the menu.' },
            { target: 'mod-filters', title: 'Find a module', body: 'Search, or show installed or not installed.' },
            { target: 'mod-list', title: 'Modules', body: 'Install one to start using it. Disabling hides it again.' },
        ],
    },
    'admin-receipt-design': {
        title: 'Receipt design',
        steps: [
            { title: 'Receipt design', body: 'How payment receipts look when printed or sent to parents.' },
            { target: 'rcpt-sections', title: 'Sections', body: 'Choose what the receipt shows.' },
            { target: 'rcpt-style', title: 'Style', body: 'Colour, logo and a footer note.' },
            { target: 'rcpt-preview', title: 'Preview', body: 'A sample receipt that updates as you change things.' },
            { target: 'rcpt-save', title: 'Save', body: 'Applies to every receipt.' },
        ],
    },
    'admin-platform-fee': {
        title: 'Platform fee',
        steps: [
            { title: 'Platform fee', body: 'What the school owes Skultem for using the system, normally paid in three parts.' },
            { target: 'pf-summary', title: 'Totals', body: 'Expected, collected and outstanding.' },
            { target: 'pf-list', title: 'Payments', body: 'Each installment and payment.' },
        ],
    },
    'admin-materials': {
        title: 'Materials',
        steps: [
            { title: 'Materials', body: 'Books, uniforms and other items the school sells or supplies, with their stock.' },
            { target: 'mat-tabs', title: 'Materials & supplies', body: 'Stock, sales, supplies, pending pickups and categories.' },
            { target: 'mat-add', title: 'Add an item', body: 'Name, category, price and stock.' },
            { target: 'mat-restock', title: 'Restock', body: 'Add new stock when it arrives.' },
            { target: 'adm-list', title: 'Items', body: 'Each item with its price and stock left.' },
        ],
    },
    'admin-material-sales': {
        title: 'Material sales',
        steps: [
            { title: 'Sales', body: 'Items sold to students and parents, paid and not yet paid.' },
            { target: 'mat-sale-add', title: 'New sale', body: 'Record a sale to a student.' },
            { target: 'mat-sale-status', title: 'Status', body: 'Filter sales by status.' },
            { target: 'adm-list', title: 'Sales', body: 'Record a payment, hand the item over (fulfil) or cancel a sale.' },
        ],
    },
    'admin-material-supply': {
        title: 'Supplies',
        steps: [
            { title: 'Supplies', body: 'Items given to students as part of a fee they paid, e.g. a uniform in the admission fee.' },
            { target: 'mat-supply-add', title: 'Give an item', body: 'Record an item given to a student.' },
            { target: 'adm-list', title: 'Supplies', body: 'What each student has received.' },
        ],
    },
    'admin-material-pickups': {
        title: 'Pending pickups',
        steps: [
            { title: 'Pending pickups', body: 'Items paid for - by a sale or a fee - that the student hasn\'t collected yet.' },
            { target: 'adm-list', title: 'Waiting', body: 'Who is still waiting, and for what. When they collect it, fulfil the sale on the Sales tab.' },
        ],
    },
    'admin-material-categories': {
        title: 'Material categories',
        steps: [
            { title: 'Categories', body: 'Groups for materials, e.g. Uniforms, Books, Stationery.' },
            { target: 'mat-cat-add', title: 'Add a category', body: 'Name and describe it.' },
            { target: 'adm-list', title: 'Categories', body: 'Edit or delete a category.' },
        ],
    },
    'lib-dashboard': {
        title: 'Library',
        steps: [
            { title: 'Library', body: 'Books, loans and library visits. Each section can run its own library with its own books, staff and rules.' },
            { target: 'lib-tabs', title: 'Library sections', body: 'Dashboard, books, issue and return, visits, class sessions, reports, categories and settings.' },
            { target: 'lib-stats', title: 'At a glance', body: 'Titles, copies available, overdue loans and categories.' },
            { target: 'lib-overdue', title: 'Overdue', body: 'Books that should be back. Follow up with the borrowers.' },
            { target: 'lib-issue-btn', title: 'Issue a book', body: 'Lend a book to a student or teacher.' },
            { target: 'lib-recent', title: 'Recent loans', body: 'The latest loans. Press Return when a book comes back.' },
            { target: 'lib-stock', title: 'Out of stock', body: 'Titles with no copies left to lend.' },
        ],
    },
    'lib-books': {
        title: 'Books',
        steps: [
            { title: 'Books', body: 'Every title in the library with its copies.' },
            { target: 'lib-book-add', title: 'Add a book', body: 'Title, author, ISBN, category and how many copies.' },
            { target: 'adm-search', title: 'Find a book', body: 'Search by title, author or ISBN, or filter by category and section.' },
            { target: 'adm-list', title: 'Books', body: 'Open a book to see its copies and loan history.' },
        ],
    },
    'lib-issue': {
        title: 'Issue / Return',
        steps: [
            { title: 'Loans', body: 'Every book lent out, and returns.' },
            { target: 'lib-issue-btn', title: 'Issue a book', body: 'Pick the book, the borrower (student or teacher) and the due date.' },
            { target: 'adm-search', title: 'Find a loan', body: 'Search by book or borrower, or filter by status - out, overdue or returned.' },
            { target: 'adm-list', title: 'Loans', body: 'Press Return when a book comes back.' },
        ],
    },
    'lib-categories': {
        title: 'Book categories',
        steps: [
            { title: 'Categories', body: 'Groups for books, e.g. Fiction, Science, Reference.' },
            { target: 'lib-cat-add', title: 'Add a category', body: 'Name and describe it.' },
            { target: 'adm-search', title: 'Find', body: 'Search categories.' },
            { target: 'adm-list', title: 'Categories', body: 'Edit or delete a category.' },
        ],
    },
    'lib-settings': {
        title: 'Library settings',
        steps: [
            { title: 'Borrowing rules', body: 'How many books people can hold, for how long, and what happens when one is overdue.' },
            { target: 'lib-set-section', title: 'School or section', body: 'Set the school\'s rules, or give a section\'s library its own.' },
            { target: 'lib-set-form', title: 'The rules', body: 'Books a student and a teacher can hold, the loan period, and whether an overdue book blocks more borrowing.' },
            { target: 'lib-set-save', title: 'Save', body: 'Applies to new loans.' },
        ],
    },
    'lib-visits': {
        title: 'Library visits',
        steps: [
            { title: 'Library visits', body: 'Students who come to the library on their own - checked in and out.' },
            { target: 'lib-att-tabs', title: 'Attendance', body: 'Visits, class sessions and reports.' },
            { target: 'lib-att-stats', title: 'Today', body: 'Who is in now, visits not checked out, class sessions and incomplete registers.' },
            { target: 'lib-checkin', title: 'Check in', body: 'Record students coming in - several at once if they come together.' },
            { target: 'adm-search', title: 'Find a visit', body: 'Search by student or class, and pick the dates.' },
            { target: 'adm-list', title: 'Visits', body: 'Check students out when they leave. Visits never checked out need a follow-up.' },
        ],
    },
    'lib-sessions': {
        title: 'Class sessions',
        steps: [
            { title: 'Class sessions', body: 'Library periods on the timetable, when a whole class comes in.' },
            { target: 'lib-att-stats', title: 'Today', body: 'Sessions today and registers not finished.' },
            { target: 'lib-week', title: 'Week', body: 'Move between weeks.' },
            { target: 'adm-list', title: 'Sessions', body: 'Press Take Register when the class arrives, or cancel a session that isn\'t happening.' },
        ],
    },
    'lib-att-reports': {
        title: 'Attendance reports',
        steps: [
            { title: 'Library attendance reports', body: 'Visits and class sessions over a period, and one student\'s history.' },
            { target: 'lib-main', title: 'Reports', body: 'Pick the dates and export, or pick a student to see their visits.' },
        ],
    },
    'nurse-dashboard': {
        title: 'Health care',
        steps: [
            { title: 'Sick bay', body: 'Who is in the sick bay, who needs a follow-up, and today\'s visits.' },
            { target: 'hc-tabs', title: 'Health care', body: 'Dashboard, start a visit, visits, reports and settings.' },
            { target: 'hc-stats', title: 'Today', body: 'In the sick bay now, needing follow-up, sent home or referred, and turned away.' },
            { target: 'hc-start', title: 'Start a visit', body: 'Record a student arriving at the sick bay.' },
            { target: 'hc-in-bay', title: 'In the sick bay', body: 'Students here now. Open one to add treatment and close the visit.' },
            { target: 'hc-followup', title: 'Needs follow-up', body: 'Visits that need checking on again.' },
        ],
    },
    'nurse-start-visit': {
        title: 'Start a visit',
        steps: [
            { target: 'hcv-student', title: 'Student', body: 'Search for the student who came in.' },
            { target: 'hcv-complaint', title: 'Complaint', body: 'What is wrong. Urgent complaints are never turned away by a visit limit.' },
            { target: 'hcv-history', title: 'Their visits', body: 'Earlier visits and any limit they have reached - the system tells you before you start.' },
            { target: 'hcv-temp', title: 'Temperature', body: 'Required if the school says so.' },
            { target: 'hcv-brought', title: 'Brought by', body: 'Who brought the student in.' },
            { target: 'hcv-save', title: 'Start', body: 'Opens the visit. Add treatment and the outcome when they leave.' },
        ],
    },
    'nurse-visits': {
        title: 'Visits',
        steps: [
            { title: 'Sick bay visits', body: 'Every visit with the complaint, treatment and outcome.' },
            { target: 'hc-start', title: 'Start a visit', body: 'Record a new visit.' },
            { target: 'adm-search', title: 'Find a visit', body: 'Search by student or class, or filter by date and complaint.' },
            { target: 'adm-list', title: 'Visits', body: 'Open a visit to see or finish it.' },
        ],
    },
    'nurse-settings': {
        title: 'Health care settings',
        steps: [
            { title: 'Settings', body: 'How the sick bay works at this school.' },
            { target: 'hcs-limits', title: 'Visit limits', body: 'How often a student may visit, e.g. 3 a week, and whether to warn, ask for a reason or refuse.' },
            { target: 'hcs-meds', title: 'Medication', body: 'The medicines the nurse can give.' },
            { target: 'hcs-required', title: 'What must be recorded', body: 'Make temperature or "brought by" required.' },
            { target: 'hcs-notify', title: 'Who is told', body: 'When parents and the principal are notified.' },
            { target: 'hcs-complaints', title: 'Complaints', body: 'The list of complaints to pick from, and which are urgent.' },
        ],
    },
    'nurse-report-daily': {
        title: 'Daily log',
        steps: [
            { title: 'Daily log', body: 'Every visit on one day.' },
            { target: 'hcr-filters', title: 'Period', body: 'Pick the day or the dates.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF, or export a spreadsheet.' },
        ],
    },
    'nurse-report-summary': {
        title: 'Visits summary',
        steps: [
            { title: 'Visits summary', body: 'Visits over a period by complaint, class and outcome.' },
            { target: 'hcr-filters', title: 'Period', body: 'Pick the day or the dates.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF, or export a spreadsheet.' },
        ],
    },
    'nurse-report-frequent': {
        title: 'Frequent visitors',
        steps: [
            { title: 'Frequent visitors', body: 'Students who visit most often - worth a word with their parents.' },
            { target: 'hcr-filters', title: 'Period', body: 'Pick the day or the dates.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF, or export a spreadsheet.' },
        ],
    },
    'nurse-report-limits': {
        title: 'Limits & turned away',
        steps: [
            { title: 'Limits & turned away', body: 'Students who reached a visit limit or were turned away.' },
            { target: 'hcr-filters', title: 'Period', body: 'Pick the day or the dates.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF, or export a spreadsheet.' },
        ],
    },
    'nurse-report-trends': {
        title: 'Health trends',
        steps: [
            { title: 'Health trends', body: 'How complaints change over time - spot an outbreak early.' },
            { target: 'hcr-filters', title: 'Period', body: 'Pick the day or the dates.' },
            { target: 'rep-preview', title: 'The report', body: 'Laid out for printing.' },
            { target: 'rep-download', title: 'Download', body: 'Save it as a PDF, or export a spreadsheet.' },
        ],
    },
    'parent-dashboard': {
        title: 'Welcome',
        steps: [
            { title: 'Welcome to the parent portal', body: 'See how your child is doing at school - results, attendance, fees and more. Here is a quick look around.' },
            { target: 'par-pick', title: 'Child and term', body: 'If you have more than one child at the school, pick which one. Then pick the term.' },
            { target: 'par-insight', title: 'The main thing', body: 'One line on what needs your attention - an unpaid balance, low attendance, or that all is well.' },
            { target: 'par-stats', title: 'At a glance', body: 'Average score, class position, attendance and fees.' },
            { target: 'par-charts', title: 'Progress', body: 'How results have moved over time and by subject.' },
            { target: 'par-info', title: 'Your child', body: 'Their class and details. View Class shows their class.' },
            { target: 'guide-button', title: 'Need this again?', body: 'Press Guide on any page to see its walkthrough again.' },
        ],
    },
    'parent-attendance': {
        title: 'Attendance',
        steps: [
            { target: 'par-child', title: 'Child', body: 'Pick your child.' },
            { target: 'par-term', title: 'Term', body: 'Pick the term.' },
            { target: 'par-calendar', title: 'Calendar', body: 'Each school day marked present, late, excused or absent. You also get a message when your child is absent.' },
        ],
    },
    'parent-grades': {
        title: 'Grades',
        steps: [
            { target: 'par-pick', title: 'Child and term', body: 'Pick your child and the term.' },
            { target: 'par-stats', title: 'Summary', body: 'How many A and B grades, and their position in class.' },
            { title: 'Subjects', body: 'Below, every subject with its scores for each test.' },
        ],
    },
    'parent-timetable': {
        title: 'Timetable',
        steps: [
            { target: 'par-child', title: 'Child', body: 'Pick your child to see their class timetable.' },
            { target: 'par-timetable', title: 'The week', body: 'Each day\'s lessons, with times and teachers.' },
            { target: 'par-download', title: 'Download', body: 'Save the timetable as a PDF to print.' },
        ],
    },
    'parent-performance': {
        title: 'Performance',
        steps: [
            { target: 'par-child', title: 'Child', body: 'Pick your child.' },
            { target: 'par-term', title: 'Term', body: 'Pick the term.' },
            { target: 'par-stats', title: 'At a glance', body: 'Average, position, attendance and best subject.' },
            { target: 'par-insight', title: 'Worth acting on', body: 'The subject that most needs help.' },
            { target: 'par-charts', title: 'Trends', body: 'How scores change over time and by subject.' },
        ],
    },
    'parent-fees': {
        title: 'Fees',
        steps: [
            { target: 'par-child', title: 'Child', body: 'Pick your child.' },
            { target: 'par-fee-summary', title: 'Summary', body: 'Total fees, what has been paid, discounts and what is left.' },
            { target: 'par-fee-overview', title: 'Fees', body: 'Each fee and its balance, including installments due.' },
            { target: 'par-fee-history', title: 'Payments', body: 'Every payment made, with its receipt.' },
        ],
    },
    'parent-report-cards': {
        title: 'Report cards',
        steps: [
            { target: 'par-child', title: 'Child', body: 'Pick your child.' },
            { target: 'par-cards', title: 'Report cards', body: 'Each term\'s report card, once the class teacher approves it. Open one to view or download it.' },
        ],
    },
    'parent-curriculum': {
        title: 'Curriculum',
        steps: [
            { target: 'par-child', title: 'Child', body: 'Pick your child.' },
            { target: 'par-term', title: 'Term', body: 'Pick the term.' },
            { target: 'par-stats', title: 'Coverage', body: 'How much of the term\'s work has been taught.' },
            { target: 'par-subjects', title: 'Subjects', body: 'Each subject\'s progress. Open one to see what is taught each week.' },
        ],
    },
    'parent-exam-timetable': {
        title: 'Exam timetable',
        steps: [
            { title: 'Exam timetable', body: 'When and where your child sits each exam paper. You get a message when a timetable is published.' },
            { target: 'par-child', title: 'Child', body: 'Pick your child.' },
            { target: 'exam-assessments', title: 'Which exams', body: 'If more than one timetable is published - 1st Test, Exam and so on - pick one here.' },
            { target: 'exam-timetable-header', title: 'Dates and rules', body: 'The exam period and the instructions for candidates.' },
            { target: 'exam-papers', title: 'Day by day', body: 'Your child\'s papers with their date, time and venue.' },
            { target: 'exam-download', title: 'Download', body: 'Save it as a PDF to print.' },
        ],
    },
    'sys-schools': {
        title: 'Schools',
        steps: [
            { title: 'Schools', body: 'Every school on Skultem.' },
            { target: 'sa-action', title: 'Onboard a school', body: 'Create a new school with its domain and first admin.' },
            { target: 'adm-search', title: 'Find a school', body: 'Search by name or domain, or filter by status and type.' },
            { target: 'adm-list', title: 'Schools', body: 'Use the menu to edit a school, set its platform fee, take it live or switch it back to playground.' },
        ],
    },
    'sys-demo-requests': {
        title: 'Demo requests',
        steps: [
            { title: 'Demo requests', body: 'Schools that asked for a demo on the marketing site.' },
            { target: 'adm-list', title: 'Requests', body: 'Each request with its message and lead. Open the lead to follow up.' },
        ],
    },
    'sys-fee-collection': {
        title: 'Platform fee collection',
        steps: [
            { title: 'Platform fee collection', body: 'Platform fees billed and collected across schools.' },
            { target: 'sa-stats', title: 'Totals', body: 'Billed to students, collected and still to collect.' },
            { target: 'adm-search', title: 'Find a school', body: 'Search, or show only schools still owing or fully paid.' },
            { target: 'adm-list', title: 'Schools', body: 'What each school owes and has paid.' },
        ],
    },
    'sys-leads': {
        title: 'Leads & follow-ups',
        steps: [
            { title: 'Leads & follow-ups', body: 'Every enquiry, worked until it becomes a school.' },
            { target: 'sa-stats', title: 'Pipeline', body: 'Open leads, those awaiting follow-up and those unassigned.' },
            { target: 'sa-action', title: 'Add a lead', body: 'Record an enquiry from a call or visit.' },
            { target: 'adm-search', title: 'Find', body: 'Search name, school, email or phone, and filter by status or owner.' },
            { target: 'adm-list', title: 'Leads', body: 'Open a lead to log contact, set the next follow-up or move it on.' },
        ],
    },
    'sys-onboarding': {
        title: 'School onboarding',
        steps: [
            { title: 'School onboarding', body: 'New schools from first demo to launch.' },
            { target: 'sa-stats', title: 'Progress', body: 'Schools in progress, completed, behind schedule and unassigned.' },
            { target: 'adm-search', title: 'Find', body: 'Search school or contact.' },
            { target: 'adm-list', title: 'Schools', body: 'Open one to work through its onboarding steps.' },
            { target: 'sa-action', title: 'Leads', body: 'Go back to the leads list.' },
        ],
    },
    'sys-announcements': {
        title: 'Announcements',
        steps: [
            { title: 'Announcements', body: 'Messages every user in every school sees on their notice board.' },
            { target: 'sa-action', title: 'New announcement', body: 'Write a message for all schools, with a level and the dates to show it.' },
            { target: 'adm-list', title: 'Announcements', body: 'Each announcement shows if it is live, scheduled or ended. Edit or delete it from its menu.' },
        ],
    },
    'sys-testimonials': {
        title: 'Testimonials',
        steps: [
            { title: 'Testimonials', body: 'What schools say, shown on the marketing site.' },
            { target: 'sa-action', title: 'Add a testimonial', body: 'The quote, who said it, their school and a rating.' },
            { target: 'adm-list', title: 'Testimonials', body: 'Edit or delete each one. Only published ones show on the site; featured ones come first.' },
        ],
    },
    'sys-videos': {
        title: 'Videos',
        steps: [
            { title: 'Videos', body: 'YouTube videos on the marketing site.' },
            { target: 'sa-action', title: 'Add a video', body: 'Paste the YouTube link and give it a title.' },
            { target: 'adm-list', title: 'Videos', body: 'Edit or delete videos. Display order and Featured decide where they show.' },
        ],
    },
    'sys-blog': {
        title: 'Blog',
        steps: [
            { title: 'Blog', body: 'Articles on the marketing site.' },
            { target: 'sa-action', title: 'New post', body: 'Write an article. It stays a draft until published.' },
            { target: 'adm-list', title: 'Posts', body: 'Open a post to edit, publish or unpublish it.' },
        ],
    },
    'sys-contact-messages': {
        title: 'Contact messages',
        steps: [
            { title: 'Contact messages', body: 'Messages from the marketing site\'s contact form.' },
            { target: 'adm-list', title: 'Messages', body: 'Open a message to read it, reply by email, or open its lead.' },
        ],
    },
    'sys-support': {
        title: 'Support tickets',
        steps: [
            { title: 'Support tickets', body: 'Schools asking for help.' },
            { target: 'sa-stats', title: 'Queue', body: 'Open and unassigned tickets.' },
            { target: 'sa-action', title: 'Open a ticket', body: 'Log a request that came by phone or email.' },
            { target: 'adm-search', title: 'Find', body: 'Search, and filter by status, priority or who it is assigned to.' },
            { target: 'adm-list', title: 'Tickets', body: 'Open a ticket to reply, assign or close it.' },
        ],
    },
    'sys-notifications': {
        title: 'Notifications',
        steps: [
            { title: 'Notifications', body: 'What schools send their parents, teachers and staff - and whether it is read.' },
            { target: 'sa-stats', title: 'Summary', body: 'Messages sent and read for the period.' },
            { target: 'adm-search', title: 'Find', body: 'Search by title or school.' },
            { target: 'adm-list', title: 'School broadcasts', body: 'Each broadcast with its school and reach.' },
            { target: 'sn-side', title: 'By type', body: 'In-app notifications by type, and a link to announcements.' },
        ],
    },
    'sys-system-health': {
        title: 'System health',
        steps: [
            { title: 'System health', body: 'Is the platform working?' },
            { target: 'sh-overall', title: 'Overall', body: 'Whether everything is up.' },
            { target: 'sh-monitored', title: 'Checks', body: 'Each service and dependency with its status.' },
            { target: 'sa-action', title: 'Check now', body: 'Run the checks again.' },
        ],
    },
    'sys-roles': {
        title: 'Roles & permissions',
        steps: [
            { title: 'Roles & permissions', body: 'Who on the Skultem team can do what.' },
            { target: 'role-list', title: 'Roles', body: 'Pick a role to see its permissions, or create a new one.' },
            { target: 'role-detail', title: 'Permissions', body: 'What the role can open and change.' },
            { target: 'role-members', title: 'Members', body: 'Who has the role. Change someone\'s role here.' },
        ],
    },
    'sys-platform-settings': {
        title: 'Platform settings',
        steps: [
            { title: 'Platform settings', body: 'The platform fee every student is charged.' },
            { target: 'pf-current', title: 'Current fee', body: 'What each student is charged now.' },
            { target: 'pf-change', title: 'Change the fee', body: 'Set a new amount and preview what it means before saving.' },
            { target: 'pf-side', title: 'How it is charged', body: 'Schools on a different fee, and how the fee is billed.' },
        ],
    },
    'sys-audit-logs': {
        title: 'Audit logs',
        steps: [
            { title: 'Audit logs', body: 'What happened on the platform, and who did it.' },
            { target: 'adm-search', title: 'Find', body: 'Search action, person or details.' },
            { target: 'adm-list', title: 'Entries', body: 'Every action with its time and person. Entries can\'t be changed or removed.' },
        ],
    },
    'sys-calendar': {
        title: 'Academic calendar',
        steps: [
            { title: 'Academic calendar', body: 'The national school calendar schools start from.' },
            { target: 'sa-stats', title: 'Overview', body: 'The year, its terms and where today falls.' },
            { target: 'cal-year', title: 'The year', body: 'Name and dates of the academic year.' },
            { target: 'cal-add-term', title: 'Terms', body: 'Add each term with its dates.' },
            { target: 'cal-preview', title: 'Year at a glance', body: 'A timeline of the terms and breaks.' },
            { target: 'cal-save', title: 'Save', body: 'Saves the calendar. A new name makes it the current year.' },
        ],
    },
    'sys-users': {
        title: 'System admins',
        steps: [
            { title: 'System admins', body: 'People with access across every school.' },
            { target: 'sa-stats', title: 'Summary', body: 'Admins, platform-wide access, inactive access and schools covered.' },
            { target: 'sa-action', title: 'Add an admin', body: 'Invite someone to the Skultem team.' },
            { target: 'adm-search', title: 'Find', body: 'Search by name or email.' },
            { target: 'adm-list', title: 'Admins', body: 'Change their role or deactivate them.' },
        ],
    },
    'sys-dashboard': {
        title: 'Platform overview',
        steps: [
            { title: 'Platform overview', body: 'How Skultem is doing across every school, and what needs the team\'s attention.' },
            { target: 'sys-period', title: 'Period', body: 'Choose how far back the figures go.' },
            { target: 'sa-stats', title: 'Key numbers', body: 'Schools, students, fee collection, support, leads, onboarding and demos. Tap a card to open its page.' },
            { target: 'sys-tasks', title: 'To do', body: 'Pending tasks and the inbox - start here each day.' },
            { target: 'sys-growth', title: 'Growth', body: 'Students and schools added month by month.' },
            { target: 'sys-recent', title: 'Recent', body: 'New schools and the latest platform activity.' },
        ],
    },
    'class-detail': {
        title: 'Class',
        steps: [
            { target: 'cls-header', title: 'The class', body: 'Its name, section and class master. The menu has more actions for staff who manage it.' },
            { target: 'cls-stats', title: 'At a glance', body: 'Students, attendance, average score and the class master.' },
            { target: 'cls-insights', title: 'Look at first', body: 'Students who need attention - low attendance or below the pass mark.' },
            { target: 'adm-search', title: 'Find a student', body: 'Search the class list.' },
            { target: 'cls-attention', title: 'Needs attention only', body: 'Show just the students who need attention, or sort by performance.' },
            { target: 'cls-students', title: 'Students', body: 'Each student with their position, attendance and average. Open one for their full profile.' },
        ],
    },
    'parent-class': {
        title: 'Your child\'s class',
        steps: [
            { target: 'cls-header', title: 'The class', body: 'Your child\'s class, its section and class teacher.' },
            { target: 'cls-locked', title: 'Other students', body: 'The class list is only for school staff. Your own child\'s details are on your dashboard.' },
        ],
    },
    'report-card-view': {
        title: 'Report card',
        steps: [
            { target: 'rc-review', title: 'Review status', body: 'Whether the card is waiting for the class teacher, sent back, or approved and visible to parents.' },
            { target: 'rc-summary', title: 'Summary', body: 'Average, grade, position and attendance at a glance.' },
            { target: 'rc-remark', title: 'Class teacher\'s remark', body: 'The class teacher adds a comment before approving. It locks once the card is approved.' },
            { target: 'rc-preview', title: 'The card', body: 'Exactly as it prints, with the class teacher\'s signature once approved.' },
            { target: 'rc-download', title: 'Download', body: 'Save the card as a PDF.' },
        ],
    },
    'parent-report-card': {
        title: 'Report card',
        steps: [
            { target: 'rc-summary', title: 'Summary', body: 'Your child\'s average, grade, position and attendance for the term.' },
            { target: 'rc-remark', title: 'Class teacher\'s remark', body: 'What the class teacher says about your child.' },
            { target: 'rc-preview', title: 'The report card', body: 'Every subject\'s scores and grades, signed by the class teacher.' },
            { target: 'rc-download', title: 'Download', body: 'Save it as a PDF to keep or print.' },
        ],
    },
}
