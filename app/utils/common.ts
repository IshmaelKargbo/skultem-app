export const TITLE = "Skultem"

export type Meta = {
    size: number;
    page: number;
    total: number;
    showingFrom: number;
    showingTo: number;
    totalPages: number;
}

export const unitLabelMap: Record<string, string> = {
    PCS: 'Pieces',
    BOX: 'Box',
    PACK: 'Pack',
    LITRE: 'Litre'
}

export const ALT_IMAGE = '/avatar-placeholder.svg'
export const nationalities = [
    { label: 'Afghan', value: 'AFGHAN' },
    { label: 'Albanian', value: 'ALBANIAN' },
    { label: 'Algerian', value: 'ALGERIAN' },
    { label: 'American', value: 'AMERICAN' },
    { label: 'Andorran', value: 'ANDORRAN' },
    { label: 'Angolan', value: 'ANGOLAN' },
    { label: 'Antiguan and Barbudan', value: 'ANTIGUAN_AND_BARBUDAN' },
    { label: 'Argentine', value: 'ARGENTINE' },
    { label: 'Armenian', value: 'ARMENIAN' },
    { label: 'Australian', value: 'AUSTRALIAN' },
    { label: 'Austrian', value: 'AUSTRIAN' },
    { label: 'Azerbaijani', value: 'AZERBAIJANI' },

    { label: 'Bahamian', value: 'BAHAMIAN' },
    { label: 'Bahraini', value: 'BAHRAINI' },
    { label: 'Bangladeshi', value: 'BANGLADESHI' },
    { label: 'Barbadian', value: 'BARBADIAN' },
    { label: 'Belarusian', value: 'BELARUSIAN' },
    { label: 'Belgian', value: 'BELGIAN' },
    { label: 'Belizean', value: 'BELIZEAN' },
    { label: 'Beninese', value: 'BENINESE' },
    { label: 'Bhutanese', value: 'BHUTANESE' },
    { label: 'Bolivian', value: 'BOLIVIAN' },
    { label: 'Bosnian', value: 'BOSNIAN' },
    { label: 'Botswanan', value: 'BOTSWANAN' },
    { label: 'Brazilian', value: 'BRAZILIAN' },
    { label: 'British', value: 'BRITISH' },
    { label: 'Bruneian', value: 'BRUNEIAN' },
    { label: 'Bulgarian', value: 'BULGARIAN' },
    { label: 'Burkinabe', value: 'BURKINABE' },
    { label: 'Burundian', value: 'BURUNDIAN' },

    { label: 'Cambodian', value: 'CAMBODIAN' },
    { label: 'Cameroonian', value: 'CAMEROONIAN' },
    { label: 'Canadian', value: 'CANADIAN' },
    { label: 'Cape Verdean', value: 'CAPE_VERDEAN' },
    { label: 'Central African', value: 'CENTRAL_AFRICAN' },
    { label: 'Chadian', value: 'CHADIAN' },
    { label: 'Chilean', value: 'CHILEAN' },
    { label: 'Chinese', value: 'CHINESE' },
    { label: 'Colombian', value: 'COLOMBIAN' },
    { label: 'Comoran', value: 'COMORAN' },
    { label: 'Congolese', value: 'CONGOLESE' },
    { label: 'Costa Rican', value: 'COSTA_RICAN' },
    { label: 'Croatian', value: 'CROATIAN' },
    { label: 'Cuban', value: 'CUBAN' },
    { label: 'Cypriot', value: 'CYPRIOT' },
    { label: 'Czech', value: 'CZECH' },

    { label: 'Danish', value: 'DANISH' },
    { label: 'Djiboutian', value: 'DJIBOUTIAN' },
    { label: 'Dominican', value: 'DOMINICAN' },
    { label: 'Dutch', value: 'DUTCH' },

    { label: 'East Timorese', value: 'EAST_TIMORESE' },
    { label: 'Ecuadorian', value: 'ECUADORIAN' },
    { label: 'Egyptian', value: 'EGYPTIAN' },
    { label: 'Emirati', value: 'EMIRATI' },
    { label: 'Equatorial Guinean', value: 'EQUATORIAL_GUINEAN' },
    { label: 'Eritrean', value: 'ERITREAN' },
    { label: 'Estonian', value: 'ESTONIAN' },
    { label: 'Eswatini', value: 'ESWATINI' },
    { label: 'Ethiopian', value: 'ETHIOPIAN' },

    { label: 'Fijian', value: 'FIJIAN' },
    { label: 'Filipino', value: 'FILIPINO' },
    { label: 'Finnish', value: 'FINNISH' },
    { label: 'French', value: 'FRENCH' },

    { label: 'Gabonese', value: 'GABONESE' },
    { label: 'Gambian', value: 'GAMBIAN' },
    { label: 'Georgian', value: 'GEORGIAN' },
    { label: 'German', value: 'GERMAN' },
    { label: 'Ghanaian', value: 'GHANAIAN' },
    { label: 'Greek', value: 'GREEK' },
    { label: 'Grenadian', value: 'GRENADIAN' },
    { label: 'Guatemalan', value: 'GUATEMALAN' },
    { label: 'Guinean', value: 'GUINEAN' },
    { label: 'Guinea-Bissauan', value: 'GUINEA_BISSAUAN' },
    { label: 'Guyanese', value: 'GUYANESE' },

    { label: 'Haitian', value: 'HAITIAN' },
    { label: 'Honduran', value: 'HONDURAN' },
    { label: 'Hungarian', value: 'HUNGARIAN' },

    { label: 'Icelandic', value: 'ICELANDIC' },
    { label: 'Indian', value: 'INDIAN' },
    { label: 'Indonesian', value: 'INDONESIAN' },
    { label: 'Iranian', value: 'IRANIAN' },
    { label: 'Iraqi', value: 'IRAQI' },
    { label: 'Irish', value: 'IRISH' },
    { label: 'Israeli', value: 'ISRAELI' },
    { label: 'Italian', value: 'ITALIAN' },
    { label: 'Ivorian', value: 'IVORIAN' },

    { label: 'Jamaican', value: 'JAMAICAN' },
    { label: 'Japanese', value: 'JAPANESE' },
    { label: 'Jordanian', value: 'JORDANIAN' },

    { label: 'Kazakh', value: 'KAZAKH' },
    { label: 'Kenyan', value: 'KENYAN' },
    { label: 'Kuwaiti', value: 'KUWAITI' },
    { label: 'Kyrgyz', value: 'KYRGYZ' },

    { label: 'Laotian', value: 'LAOTIAN' },
    { label: 'Latvian', value: 'LATVIAN' },
    { label: 'Lebanese', value: 'LEBANESE' },
    { label: 'Liberian', value: 'LIBERIAN' },
    { label: 'Libyan', value: 'LIBYAN' },
    { label: 'Liechtensteiner', value: 'LIECHTENSTEINER' },
    { label: 'Lithuanian', value: 'LITHUANIAN' },
    { label: 'Luxembourgish', value: 'LUXEMBOURGISH' },

    { label: 'Malagasy', value: 'MALAGASY' },
    { label: 'Malawian', value: 'MALAWIAN' },
    { label: 'Malaysian', value: 'MALAYSIAN' },
    { label: 'Maldivian', value: 'MALDIVIAN' },
    { label: 'Malian', value: 'MALIAN' },
    { label: 'Maltese', value: 'MALTESE' },
    { label: 'Mauritanian', value: 'MAURITANIAN' },
    { label: 'Mauritian', value: 'MAURITIAN' },
    { label: 'Mexican', value: 'MEXICAN' },
    { label: 'Moldovan', value: 'MOLDOVAN' },
    { label: 'Monacan', value: 'MONACAN' },
    { label: 'Mongolian', value: 'MONGOLIAN' },
    { label: 'Montenegrin', value: 'MONTENEGRIN' },
    { label: 'Moroccan', value: 'MOROCCAN' },
    { label: 'Mozambican', value: 'MOZAMBICAN' },
    { label: 'Myanmar', value: 'MYANMAR' },

    { label: 'Namibian', value: 'NAMIBIAN' },
    { label: 'Nepalese', value: 'NEPALESE' },
    { label: 'New Zealander', value: 'NEW_ZEALANDER' },
    { label: 'Nicaraguan', value: 'NICARAGUAN' },
    { label: 'Nigerian', value: 'NIGERIAN' },
    { label: 'Nigerien', value: 'NIGERIEN' },
    { label: 'North Korean', value: 'NORTH_KOREAN' },
    { label: 'North Macedonian', value: 'NORTH_MACEDONIAN' },
    { label: 'Norwegian', value: 'NORWEGIAN' },

    { label: 'Omani', value: 'OMANI' },

    { label: 'Pakistani', value: 'PAKISTANI' },
    { label: 'Palestinian', value: 'PALESTINIAN' },
    { label: 'Panamanian', value: 'PANAMANIAN' },
    { label: 'Papua New Guinean', value: 'PAPUA_NEW_GUINEAN' },
    { label: 'Paraguayan', value: 'PARAGUAYAN' },
    { label: 'Peruvian', value: 'PERUVIAN' },
    { label: 'Polish', value: 'POLISH' },
    { label: 'Portuguese', value: 'PORTUGUESE' },

    { label: 'Qatari', value: 'QATARI' },

    { label: 'Romanian', value: 'ROMANIAN' },
    { label: 'Russian', value: 'RUSSIAN' },
    { label: 'Rwandan', value: 'RWANDAN' },

    { label: 'Saint Lucian', value: 'SAINT_LUCIAN' },
    { label: 'Salvadoran', value: 'SALVADORAN' },
    { label: 'Samoan', value: 'SAMOAN' },
    { label: 'Saudi', value: 'SAUDI' },
    { label: 'Senegalese', value: 'SENEGALESE' },
    { label: 'Serbian', value: 'SERBIAN' },
    { label: 'Sierra Leonean', value: 'SIERRA_LEONEAN' },
    { label: 'Singaporean', value: 'SINGAPOREAN' },
    { label: 'Slovak', value: 'SLOVAK' },
    { label: 'Slovenian', value: 'SLOVENIAN' },
    { label: 'Somali', value: 'SOMALI' },
    { label: 'South African', value: 'SOUTH_AFRICAN' },
    { label: 'South Korean', value: 'SOUTH_KOREAN' },
    { label: 'South Sudanese', value: 'SOUTH_SUDANESE' },
    { label: 'Spanish', value: 'SPANISH' },
    { label: 'Sri Lankan', value: 'SRI_LANKAN' },
    { label: 'Sudanese', value: 'SUDANESE' },
    { label: 'Surinamese', value: 'SURINAMESE' },
    { label: 'Swedish', value: 'SWEDISH' },
    { label: 'Swiss', value: 'SWISS' },
    { label: 'Syrian', value: 'SYRIAN' },

    { label: 'Taiwanese', value: 'TAIWANESE' },
    { label: 'Tajik', value: 'TAJIK' },
    { label: 'Tanzanian', value: 'TANZANIAN' },
    { label: 'Thai', value: 'THAI' },
    { label: 'Togolese', value: 'TOGOLESE' },
    { label: 'Tongan', value: 'TONGAN' },
    { label: 'Trinidadian and Tobagonian', value: 'TRINIDADIAN_AND_TOBAGONIAN' },
    { label: 'Tunisian', value: 'TUNISIAN' },
    { label: 'Turkish', value: 'TURKISH' },
    { label: 'Turkmen', value: 'TURKMEN' },

    { label: 'Ugandan', value: 'UGANDAN' },
    { label: 'Ukrainian', value: 'UKRAINIAN' },
    { label: 'Uruguayan', value: 'URUGUAYAN' },
    { label: 'Uzbek', value: 'UZBEK' },

    { label: 'Venezuelan', value: 'VENEZUELAN' },
    { label: 'Vietnamese', value: 'VIETNAMESE' },

    { label: 'Yemeni', value: 'YEMENI' },

    { label: 'Zambian', value: 'ZAMBIAN' },
    { label: 'Zimbabwean', value: 'ZIMBABWEAN' }
]

export const parseFeeStatusColor: Record<string, string> = {
    Paid: 'success',
    Pending: 'error',
    Partial: 'info'
}

export const parseFeeStatusIcon: Record<string, string> = {
    Pending: 'i-lucide-clock',
    Paid: 'i-lucide-check-circle',
    Partial: 'ph:circle-half-tilt-duotone',
}

export enum Level {
    Primary = 'Primary',
    JSS = 'JSS',
    SSS = 'SSS',
}

export const parseTrend = {
    Improved: {
        icon: IMPROVED_ICON,
        color: 'success'
    },
    Stable: {
        icon: STABLE_ICON,
        color: 'neutral'
    },
    Dropped: {
        icon: DROPPED_ICON,
        color: 'error'
    }
}

export function generateColors(count: number) {
    return Array.from({ length: count }, (_, i) =>
        `hsl(${Math.floor(Math.random() * 360)},70%,55%)`
    )
}

export enum Role {
    OWNER = 'OWNER',
    PROPRIETOR = 'PROPRIETOR',
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    PARENT = 'PARENT',
    ACCOUNTANT = 'ACCOUNTANT'
}

export const roles = [
    {
        label: 'Proprietor',
        value: Role.PROPRIETOR.toString()
    },
    {
        label: 'Admin',
        value: Role.ADMIN.toString()
    },
    {
        label: 'Accountant',
        value: Role.ACCOUNTANT.toString()
    }
]

export const directionOptions = [
    {
        label: 'Credit',
        value: "CREDIT"
    },
    {
        label: 'Decit',
        value: "DEBIT"
    }
]

export const typeOptions = [
    {
        label: 'Fee Assignment',
        value: "FEE_ASSIGNMENT"
    },
    {
        label: 'Payment',
        value: "PAYMENT"
    },
    {
        label: 'Discount',
        value: "DISCOUNT"
    },
    {
        label: 'Expense',
        value: "EXPENSE"
    },
    {
        label: 'Adjustment',
        value: "ADJUSTMENT"
    }
]

export const monthOrder: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
}

export const referenceTypeOptions = [
    {
        label: 'Student',
        value: "STUDENT"
    },
    {
        label: 'Expense',
        value: "EXPENSE"
    },
    {
        label: 'System',
        value: "SYSTEM"
    },
    {
        label: 'Other',
        value: "OTHER"
    }
]

export const paymentMethods = {
    BANK: {
        label: 'Bank',
        color: 'success',
        icon: 'mdi-bank'
    },
    MOBILE_MONEY: {
        label: 'Mobile Money',
        color: 'info',
        icon: 'proicons:phone'
    },
    CASH: {
        label: 'Cash',
        color: 'neutral',
        icon: 'game-icons:cash'
    },
}

export const parseRole: Record<string, string> = {
    OWNER: 'Owner',
    PROPRIETOR: 'Proprietor',
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accounttant'
}

export const parseRoleColor: Record<string, string> = {
    OWNER: 'success',
    PROPRIETOR: 'primary',
    ADMIN: 'info',
    TEACHER: 'neutral',
    PARENT: 'primary',
    ACCOUNTANT: 'error'
}

export const parseRoleIcon: Record<string, string> = {
    ADMIN: 'fluent:building-24-regular',
    OWNER: 'fluent:crown-24-regular',
    PROPRIETOR: 'fluent:crown-24-regular',
    TEACHER: 'fluent:hat-graduation-24-regular',
    PARENT: 'fluent:people-24-regular',
    ACCOUNTANT: 'fluent:calculator-24-regular'
}

export function clean(str: string) {
    return str
        .toLowerCase()
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export type AssignmentSubject = {
    subjectId: string
    groupId: string
    mandatory: boolean
    locked?: boolean
}

export type AssignmentTeacherSubject = {
    id: string
    subjectId: string
    teacherId: string
}

export const runtimeConf = () => {
    return { limit: Number.parseInt(useRuntimeConfig().public.limit) }
}

export const parseGenderColor: Record<string, string> = {
    MALE: 'success',
    FEMALE: 'info'
}


export type Option = {
    label: string
    value: string
}

export const levels = [
    { label: 'Primary', value: Level.Primary },
    { label: 'JSS', value: Level.JSS },
    { label: 'SSS', value: Level.SSS },
]

export function handleScroll(event: Event) {
    const target = event.target as HTMLElement
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - 10) {
        console.log("Reached bottom!")
    }
}

export const parseLevel: Record<string, string> = {
    'PRIMARY': 'Primary',
    'JSS': 'JSS',
    'SSS': 'SSS'
}

export const parseGender: Record<string, string> = {
    'MALE': 'Male',
    'FEMALE': 'Female'
}

export const genderOption: Option[] = [
    {
        label: 'Male',
        value: 'MALE'
    },
    {
        label: 'Female',
        value: 'FEMALE'
    }
]

export const parseBehaviourKind: Record<string, string> = {
    'POSITIVE': 'Positive',
    'NEGATIVE': 'Negative',
    'NEUTRAL': 'Neutral'
}

export const parseBehaviourKindColor: Record<string, string> = {
    'POSITIVE': 'success',
    'NEGATIVE': 'error',
    'NEUTRAL': 'neutral'
}

export const parseTitle: Record<string, string> = {
    MR: 'Mr.',
    MRS: 'Mrs.',
    MISS: 'Miss',
    MS: 'Ms.',
    DR: 'Dr.',
    PROF: 'Prof.',
    REV: 'Rev.',
    HON: 'Hon.',
    ENG: 'Eng.',
    SIR: 'Sir',
    MADAM: 'Madam'
}

export function parseClass(clazz: Enrollment) {
    let value = `${clazz.clazz.name} ( ${clazz.section.name} )`

    if (!clazz.stream) return value;
    return `${clazz.clazz.name} ( ${clazz.section.name} - ${clazz.stream.name} )`
}


export function parseClassSession(clazz: ClassSession) {
    let value = `${clazz.clazz} (${clazz.sectionName})`

    if (!clazz.streamId) return value;
    return `${clazz.clazz} (${clazz.sectionName} - ${clazz.streamName})`
}

export function formatDate(dateStr: string): string {
    if (dateStr == "" || dateStr == null) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export function formatDateString(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toDateString()
}

export function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const useMoney = () => {
    const format = (value: number) =>
        new Intl.NumberFormat('en-SL', { style: 'currency', currency: 'NLE', minimumFractionDigits: 2 }).format(value)

    return { format }
}

export function useMeta(meta: any) {
    const showingFrom = meta.count === 0 ? 0 : (meta.page - 1) * meta.size + 1
    const showingTo = meta.page * meta.size < meta.count ? meta.page * meta.size : meta.count

    return {
        total: meta.count,
        size: meta.size,
        page: meta.page,
        showingFrom: showingFrom,
        showingTo: showingTo,
        totalPages: Math.ceil(meta.count / meta.size)
    }
}

export const useHandleError = (err: any) => {
    const validationErrors = err?.data?.errors || err?.response?._data?.errors
    if (validationErrors && typeof validationErrors === 'object') {
        const fieldMessages = Object.values(validationErrors).join(', ')
        throw new Error(fieldMessages)
    }

    const message =
        err?.data?.message ||
        err?.response?._data?.message ||
        err?.message ||
        'Something went wrong'

    throw new Error(message)
}

export const parsePaymentMethod: Record<string, string> = {
    "CASH": "Cash",
    "BANK": "Bank",
    "MOBILE_MONEY": "Mobile Money"
}
