import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { talentCount } from './talentCount';
import { equipmentStats } from './equipmentStats';

const archetype = state => state.archetype;
const archetypes = state => state.archetypes;
const creationCharacteristics = state => state.creationCharacteristics;
const talents = state => state.talents;

export const strainThreshold = state => calcStrain(state);

const calcStrain = createSelector(
    archetype,
    archetypes,
    talents,
    creationCharacteristics,
    talentCount,
    equipmentStats,
    (
        archetype,
        archetypes,
        talents,
        creationCharacteristics,
        talentCount,
        equipmentStats
    ) => {
        const startingThreshold = get(
                archetypes,
                `${archetype}.strainThreshold`,
                0
            ),
            startingWillpower = get(archetypes, `${archetype}.Willpower`, 0),
            creationWillpower = get(creationCharacteristics, 'Willpower', 0);

        //get all talents that modify strain
        const talentModifier = Object.keys(talentCount).reduce(
            (acc, talent) => {
                return (
                    acc +
                    +get(talents, `${talent}.modifier.strainThreshold`, 0) *
                        talentCount[talent]
                );
            },
            0
        );

        // see if character has "Inorganic" talent
        const inorganic = get(archetypes, `${archetype}.talents`, []).includes('Inorganic');

        //check for Gear
        const Gear = Object.keys(equipmentStats)
            .map(key => {
                const modifier = get(
                        equipmentStats,
                        `${key}.modifier.strainThreshold`,
                        0
                    ),
                    carried = get(equipmentStats, `${key}.carried`, false),
                    equipped = get(equipmentStats, `${key}.equipped`, false),
                    cybernetics = get(equipmentStats, `${key}.cybernetics`, false),
                    kind = get(equipmentStats, `${key}.type`, '');

                if ((carried && kind !== 'armor') || equipped) {
                    if (inorganic && cybernetics) {
                        return 0;
                    }
                    return +modifier;
                } else {
                    return 0;
                }
            })
            .reduce((acc, num) => acc + num, 0);
        return (
            startingThreshold +
            startingWillpower +
            creationWillpower +
            talentModifier +
            Gear
        );
    }
);
