import {kleLayoutToVIALayout} from './kle-parser';
import validate from './validated-types/keyboard-definition.validator';
import validateV2 from './validated-types/keyboard-definition-v2.validator';
import {
  KeyboardDefinition,
  KeyboardDefinitionV2,
  VIADefinition,
  VIADefinitionV2,
  VIALightingTypeDefinition,
  LightingTypeDefinition,
  KeycodeType,
  BacklightConfig,
  LightingTypeDefinitionV2
} from './types';
export {VIADefinition, KeyboardDefinition};

export function getVendorProductId({
  productId,
  vendorId
}: KeyboardDefinition | KeyboardDefinitionV2): number {
  const parsedVendorId = parseInt(vendorId, 16);
  const parsedProductId = parseInt(productId, 16);
  return parsedVendorId * 65536 + parsedProductId;
}

export function keyboardDefinitionV2ToVIADefinitionV2(
  definition: KeyboardDefinitionV2
): VIADefinitionV2 {
  const {name, customFeatures, lighting, matrix, layouts} = validateV2(
    definition
  );

  const {keymap, ...partialLayout} = layouts;
  return {
    name,
    lighting,
    layouts: {...partialLayout, ...kleLayoutToVIALayout(layouts.keymap)},
    matrix,
    customFeatures,
    vendorProductId: getVendorProductId(definition)
  };
}

export const Preset: {
  [K in LightingTypeDefinition]: VIALightingTypeDefinition;
} = {
  [LightingTypeDefinition.None]: {
    effects: [],
    keycodes: KeycodeType.None,
    supportedBacklightValues: []
  },
  [LightingTypeDefinition.QMKLighting]: {
    effects: [],
    keycodes: KeycodeType.QMK,
    supportedBacklightValues: []
  },
  [LightingTypeDefinition.WTMonoBacklight]: {
    effects: [
      ['All Off', 0],
      ['All On', 0],
      ['Raindrops', 0]
    ],
    keycodes: KeycodeType.WT,
    supportedBacklightValues: [
      BacklightConfig.BRIGHTNESS,
      BacklightConfig.EFFECT,
      BacklightConfig.EFFECT_SPEED,
      BacklightConfig.DISABLE_AFTER_TIMEOUT,
      BacklightConfig.DISABLE_WHEN_USB_SUSPENDED
    ]
  },
  [LightingTypeDefinition.WTRGBBacklight]: {
    effects: [
      ['All Off', 0],
      ['Solid Color 1', 1],
      ['Alphas/Mods Color 1/2', 2],
      ['Gradient Vertical Color 1/2', 2],
      ['Raindrops Color 1/2', 2],
      ['Cycle All', 0],
      ['Cycle Horizontal', 0],
      ['Cycle Vertical', 0],
      ['Jellybean Raindrops', 0],
      ['Radial All Hues', 0],
      ['Radial Color 1', 1]
    ],
    keycodes: KeycodeType.WT,
    supportedBacklightValues: [
      BacklightConfig.BRIGHTNESS,
      BacklightConfig.EFFECT,
      BacklightConfig.EFFECT_SPEED,
      BacklightConfig.DISABLE_AFTER_TIMEOUT,
      BacklightConfig.DISABLE_WHEN_USB_SUSPENDED,
      BacklightConfig.COLOR_1,
      BacklightConfig.COLOR_2,
      BacklightConfig.CAPS_LOCK_INDICATOR_COLOR,
      BacklightConfig.CAPS_LOCK_INDICATOR_ROW_COL,
      BacklightConfig.LAYER_1_INDICATOR_COLOR,
      BacklightConfig.LAYER_1_INDICATOR_ROW_COL,
      BacklightConfig.LAYER_2_INDICATOR_COLOR,
      BacklightConfig.LAYER_2_INDICATOR_ROW_COL,
      BacklightConfig.LAYER_3_INDICATOR_COLOR,
      BacklightConfig.LAYER_3_INDICATOR_ROW_COL
    ]
  }
};

export function getLightingDefinition(
  definition: LightingTypeDefinitionV2
): VIALightingTypeDefinition {
  if (typeof definition === 'string') {
    return Preset[definition];
  } else {
    return {...Preset[definition.extends], ...definition};
  }
}

export function keyboardDefinitionToVIADefinition(
  definition: KeyboardDefinition
): VIADefinition {
  const {name, lighting, matrix} = validate(definition);
  const layouts = Object.entries(definition.layouts).reduce(
    (p, [k, v]) => ({...p, [k]: kleLayoutToVIALayout(v)}),
    {}
  );
  return {
    name,
    lighting,
    layouts,
    matrix,
    vendorProductId: getVendorProductId(definition)
  };
}

export function generateVIADefinitionLookupMap(
  definitions: KeyboardDefinition[]
) {
  return definitions
    .map(keyboardDefinitionToVIADefinition)
    .reduce((p, n) => ({...p, [n.vendorProductId]: n}), {});
}

export function generateVIADefinitionV2LookupMap(
  definitions: KeyboardDefinitionV2[]
) {
  return definitions
    .map(keyboardDefinitionV2ToVIADefinitionV2)
    .reduce((p, n) => ({...p, [n.vendorProductId]: n}), {});
}
