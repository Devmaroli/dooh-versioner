// Screen presets for the app, imported with the v1.5 engine from the Screen Manager JSON.
import Adapt from '../engine/adapt.js'
import ae from './screens/AE_ScreenManager_Config.json'
import combiners from './screens/AE_ScreenManager_Combiners.json'
import alshaheed from './screens/Alshaheed_Screens_ScreenManager.json'
import screenAdapter from './screens/ScreenAdapter_Config.json'

const problems = []
const screens = Adapt.mergePresets(
  [
    Adapt.importScreenList(ae, 'AE_ScreenManager_Config.json', problems),
    Adapt.importScreenList(screenAdapter, 'ScreenAdapter_Config.json', problems),
    Adapt.importScreenList(alshaheed, 'Alshaheed_Screens_ScreenManager.json', problems),
  ],
  problems,
)
const combined = Adapt.importCombiners(
  combiners,
  screens,
  'AE_ScreenManager_Combiners.json',
  problems,
)

export const PRESET_PROBLEMS = problems
export const SCREENS = [...screens, ...combined]

export const DEFAULT_ON = [
  '1.7HD',
  'Alshaheed - Mupi',
  '1st Ring Road',
  'Al Salam Mall',
  'Boulevard Bridge',
  'Marina_Crescent_Sync',
].filter((name) => SCREENS.some((screen) => screen.name === name))
