// Wraps the `rdcsl` package (Region/District/Chiefdom, Sierra Leone) so every region/district
// select in the app pulls from the same canonical list instead of being free text - see
// pages/schools/add.vue and components/systemAdmin/editSchoolModal.vue.
import rdcsl from 'rdcsl'

type Option = { label: string, value: string }

const toOptions = (names: string[]): Option[] => names.map((name) => ({ label: name, value: name }))

export function useRdcsl() {
    const regionOptions = toOptions(rdcsl.regions)

    // Districts are scoped to whichever region is currently selected - undefined/unknown region
    // (nothing picked yet, or a stale value that isn't a real region) yields no options rather
    // than every district in the country.
    function districtOptions(region?: string | null): Option[] {
        if (!region) return []
        return toOptions(rdcsl.regionDistricts(region) ?? [])
    }

    return { regionOptions, districtOptions }
}
