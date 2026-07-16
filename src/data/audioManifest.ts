import {
  DEFAULT_ENGLISH_ACCENT,
  type EnglishAccent,
} from '../types/audio';

export type RemoteAudioAsset = {
  key: string;
  text: string;
};

type EnglishAudioAssets = Partial<Record<EnglishAccent, RemoteAudioAsset>> & {
  legacy?: RemoteAudioAsset;
};

const enAudioByText: Record<string, EnglishAudioAssets> = {
  [normalizeText("After bath!")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_intro_1c44260b.wav",
      text: "After bath!",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_intro_1c44260b.wav",
      text: "After bath!",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_intro_1c44260b.wav",
      text: "After bath!",
    },
  },
  [normalizeText("After dinner!")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_intro_740fd824.wav",
      text: "After dinner!",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_intro_740fd824.wav",
      text: "After dinner!",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_intro_740fd824.wav",
      text: "After dinner!",
    },
  },
  [normalizeText("After-Bath Clothes is complete.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/completion_3cd74744.wav",
      text: "After-Bath Clothes is complete.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/completion_3cd74744.wav",
      text: "After-Bath Clothes is complete.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/completion_3cd74744.wav",
      text: "After-Bath Clothes is complete.",
    },
  },
  [normalizeText("After-Dinner Cleanup is complete.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/completion_068a1589.wav",
      text: "After-Dinner Cleanup is complete.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/completion_068a1589.wav",
      text: "After-Dinner Cleanup is complete.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/completion_068a1589.wav",
      text: "After-Dinner Cleanup is complete.",
    },
  },
  [normalizeText("air dry dishes")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/air_dry_dishes.wav",
      text: "air dry dishes",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/air_dry_dishes.wav",
      text: "air dry dishes",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/air_dry_dishes.wav",
      text: "air dry dishes",
    },
  },
  [normalizeText("Air dry dishes.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_drag_dishes_to_rack_89144ba3.wav",
      text: "Air dry dishes.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_drag_dishes_to_rack_89144ba3.wav",
      text: "Air dry dishes.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_drag_dishes_to_rack_89144ba3.wav",
      text: "Air dry dishes.",
    },
  },
  [normalizeText("apple")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/apple.wav",
      text: "apple",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/apple.wav",
      text: "apple",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/apple.wav",
      text: "apple",
    },
  },
  [normalizeText("apron")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/apron.wav",
      text: "apron",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/apron.wav",
      text: "apron",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/apron.wav",
      text: "apron",
    },
  },
  [normalizeText("arrive home")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/arrive_home.wav",
      text: "arrive home",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/arrive_home.wav",
      text: "arrive home",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/arrive_home.wav",
      text: "arrive home",
    },
  },
  [normalizeText("Arriving Home is complete.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/completion_1f092d14.wav",
      text: "Arriving Home is complete.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/completion_1f092d14.wav",
      text: "Arriving Home is complete.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/completion_1f092d14.wav",
      text: "Arriving Home is complete.",
    },
  },
  [normalizeText("At school!")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_intro_029be165.wav",
      text: "At school!",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_intro_029be165.wav",
      text: "At school!",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_intro_029be165.wav",
      text: "At school!",
    },
  },
  [normalizeText("bag")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/bag.wav",
      text: "bag",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/bag.wav",
      text: "bag",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/bag.wav",
      text: "bag",
    },
  },
  [normalizeText("ball")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/ball.wav",
      text: "ball",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/ball.wav",
      text: "ball",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/ball.wav",
      text: "ball",
    },
  },
  [normalizeText("banana")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/banana.wav",
      text: "banana",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/banana.wav",
      text: "banana",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/banana.wav",
      text: "banana",
    },
  },
  [normalizeText("basket")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/basket.wav",
      text: "basket",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/basket.wav",
      text: "basket",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/basket.wav",
      text: "basket",
    },
  },
  [normalizeText("bath mat")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/bath_mat.wav",
      text: "bath mat",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/bath_mat.wav",
      text: "bath mat",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/bath_mat.wav",
      text: "bath mat",
    },
  },
  [normalizeText("bath sponge")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/bath_sponge.wav",
      text: "bath sponge",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/bath_sponge.wav",
      text: "bath sponge",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/bath_sponge.wav",
      text: "bath sponge",
    },
  },
  [normalizeText("Bath time!")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_intro_99927957.wav",
      text: "Bath time!",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_intro_99927957.wav",
      text: "Bath time!",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_intro_99927957.wav",
      text: "Bath time!",
    },
  },
  [normalizeText("Bathroom is complete.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/completion_95f3dfaf.wav",
      text: "Bathroom is complete.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/completion_95f3dfaf.wav",
      text: "Bathroom is complete.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/completion_95f3dfaf.wav",
      text: "Bathroom is complete.",
    },
  },
  [normalizeText("Bathroom time!")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_intro_ddb671a3.wav",
      text: "Bathroom time!",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_intro_ddb671a3.wav",
      text: "Bathroom time!",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_intro_ddb671a3.wav",
      text: "Bathroom time!",
    },
  },
  [normalizeText("bathtub")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/bathtub.wav",
      text: "bathtub",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/bathtub.wav",
      text: "bathtub",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/bathtub.wav",
      text: "bathtub",
    },
  },
  [normalizeText("bed")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/bed.wav",
      text: "bed",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/bed.wav",
      text: "bed",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/bed.wav",
      text: "bed",
    },
  },
  [normalizeText("Bedroom is complete.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/completion_832a4f40.wav",
      text: "Bedroom is complete.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/completion_832a4f40.wav",
      text: "Bedroom is complete.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/completion_832a4f40.wav",
      text: "Bedroom is complete.",
    },
  },
  [normalizeText("Bedtime story!")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_intro_c55cd5f9.wav",
      text: "Bedtime story!",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_intro_c55cd5f9.wav",
      text: "Bedtime story!",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_intro_c55cd5f9.wav",
      text: "Bedtime story!",
    },
  },
  [normalizeText("bench")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/bench.wav",
      text: "bench",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/bench.wav",
      text: "bench",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/bench.wav",
      text: "bench",
    },
  },
  [normalizeText("bite")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/bite.wav",
      text: "bite",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/bite.wav",
      text: "bite",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/bite.wav",
      text: "bite",
    },
  },
  [normalizeText("blanket")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/blanket.wav",
      text: "blanket",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/blanket.wav",
      text: "blanket",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/blanket.wav",
      text: "blanket",
    },
  },
  [normalizeText("blocks")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/blocks.wav",
      text: "blocks",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/blocks.wav",
      text: "blocks",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/blocks.wav",
      text: "blocks",
    },
  },
  [normalizeText("board")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/board.wav",
      text: "board",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/board.wav",
      text: "board",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/board.wav",
      text: "board",
    },
  },
  [normalizeText("body wash")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/body_wash.wav",
      text: "body wash",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/body_wash.wav",
      text: "body wash",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/body_wash.wav",
      text: "body wash",
    },
  },
  [normalizeText("book")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/book.wav",
      text: "book",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/book.wav",
      text: "book",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/book.wav",
      text: "book",
    },
  },
  [normalizeText("bookmark")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/bookmark.wav",
      text: "bookmark",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/bookmark.wav",
      text: "bookmark",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/bookmark.wav",
      text: "bookmark",
    },
  },
  [normalizeText("bottle")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/bottle.wav",
      text: "bottle",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/bottle.wav",
      text: "bottle",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/bottle.wav",
      text: "bottle",
    },
  },
  [normalizeText("bowl")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/bowl.wav",
      text: "bowl",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/bowl.wav",
      text: "bowl",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/bowl.wav",
      text: "bowl",
    },
  },
  [normalizeText("box")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/box.wav",
      text: "box",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/box.wav",
      text: "box",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/box.wav",
      text: "box",
    },
  },
  [normalizeText("bread")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/bread.wav",
      text: "bread",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/bread.wav",
      text: "bread",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/bread.wav",
      text: "bread",
    },
  },
  [normalizeText("Breakfast is complete.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/completion_dc162900.wav",
      text: "Breakfast is complete.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/completion_dc162900.wav",
      text: "Breakfast is complete.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/completion_dc162900.wav",
      text: "Breakfast is complete.",
    },
  },
  [normalizeText("Breakfast time!")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_intro_aa84d6d2.wav",
      text: "Breakfast time!",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_intro_aa84d6d2.wav",
      text: "Breakfast time!",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_intro_aa84d6d2.wav",
      text: "Breakfast time!",
    },
  },
  [normalizeText("brush teeth")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/brush_teeth.wav",
      text: "brush teeth",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/brush_teeth.wav",
      text: "brush teeth",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/brush_teeth.wav",
      text: "brush teeth",
    },
  },
  [normalizeText("bubble")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/bubble.wav",
      text: "bubble",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/bubble.wav",
      text: "bubble",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/bubble.wav",
      text: "bubble",
    },
  },
  [normalizeText("bucket")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/bucket.wav",
      text: "bucket",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/bucket.wav",
      text: "bucket",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/bucket.wav",
      text: "bucket",
    },
  },
  [normalizeText("buckle up")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/buckle_up.wav",
      text: "buckle up",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/buckle_up.wav",
      text: "buckle up",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/buckle_up.wav",
      text: "buckle up",
    },
  },
  [normalizeText("Buckle up.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_drag_seat_belt_buckle_c9d3ced1.wav",
      text: "Buckle up.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_drag_seat_belt_buckle_c9d3ced1.wav",
      text: "Buckle up.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_drag_seat_belt_buckle_c9d3ced1.wav",
      text: "Buckle up.",
    },
  },
  [normalizeText("build tower")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/build_tower.wav",
      text: "build tower",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/build_tower.wav",
      text: "build tower",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/build_tower.wav",
      text: "build tower",
    },
  },
  [normalizeText("Build tower.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_drag_blocks_to_tower_555a7853.wav",
      text: "Build tower.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_drag_blocks_to_tower_555a7853.wav",
      text: "Build tower.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_drag_blocks_to_tower_555a7853.wav",
      text: "Build tower.",
    },
  },
  [normalizeText("bus")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/bus.wav",
      text: "bus",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/bus.wav",
      text: "bus",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/bus.wav",
      text: "bus",
    },
  },
  [normalizeText("cabinet")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/cabinet.wav",
      text: "cabinet",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/cabinet.wav",
      text: "cabinet",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/cabinet.wav",
      text: "cabinet",
    },
  },
  [normalizeText("call everyone")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/call_everyone.wav",
      text: "call everyone",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/call_everyone.wav",
      text: "call everyone",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/call_everyone.wav",
      text: "call everyone",
    },
  },
  [normalizeText("Call everyone.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_tap_call_everyone_9e9479e4.wav",
      text: "Call everyone.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_tap_call_everyone_9e9479e4.wav",
      text: "Call everyone.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_tap_call_everyone_9e9479e4.wav",
      text: "Call everyone.",
    },
  },
  [normalizeText("Calm room!")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_intro_159b2d1e.wav",
      text: "Calm room!",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_intro_159b2d1e.wav",
      text: "Calm room!",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_intro_159b2d1e.wav",
      text: "Calm room!",
    },
  },
  [normalizeText("Calming the Room is complete.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/completion_c4279684.wav",
      text: "Calming the Room is complete.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/completion_c4279684.wav",
      text: "Calming the Room is complete.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/completion_c4279684.wav",
      text: "Calming the Room is complete.",
    },
  },
  [normalizeText("car")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/car.wav",
      text: "car",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/car.wav",
      text: "car",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/car.wav",
      text: "car",
    },
  },
  [normalizeText("carafe")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/carafe.wav",
      text: "carafe",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/carafe.wav",
      text: "carafe",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/carafe.wav",
      text: "carafe",
    },
  },
  [normalizeText("carry tray")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/carry_tray.wav",
      text: "carry tray",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/carry_tray.wav",
      text: "carry tray",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/carry_tray.wav",
      text: "carry tray",
    },
  },
  [normalizeText("Carry tray.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_drag_carry_tray_0922f9b7.wav",
      text: "Carry tray.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_drag_carry_tray_0922f9b7.wav",
      text: "Carry tray.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_drag_carry_tray_0922f9b7.wav",
      text: "Carry tray.",
    },
  },
  [normalizeText("chair")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/chair.wav",
      text: "chair",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/chair.wav",
      text: "chair",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/chair.wav",
      text: "chair",
    },
  },
  [normalizeText("check dream journal")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/check_dream_journal.wav",
      text: "check dream journal",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/check_dream_journal.wav",
      text: "check dream journal",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/check_dream_journal.wav",
      text: "check dream journal",
    },
  },
  [normalizeText("Check dream journal.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_tap_check_dream_journal_9f31efe5.wav",
      text: "Check dream journal.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_tap_check_dream_journal_9f31efe5.wav",
      text: "Check dream journal.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_tap_check_dream_journal_9f31efe5.wav",
      text: "Check dream journal.",
    },
  },
  [normalizeText("check temperature")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/check_temperature.wav",
      text: "check temperature",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/check_temperature.wav",
      text: "check temperature",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/check_temperature.wav",
      text: "check temperature",
    },
  },
  [normalizeText("Check temperature.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_check_temperature_e81c26fa.wav",
      text: "Check temperature.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_check_temperature_e81c26fa.wav",
      text: "Check temperature.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_check_temperature_e81c26fa.wav",
      text: "Check temperature.",
    },
  },
  [normalizeText("chicken")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/chicken.wav",
      text: "chicken",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/chicken.wav",
      text: "chicken",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/chicken.wav",
      text: "chicken",
    },
  },
  [normalizeText("choose snack")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/choose_snack.wav",
      text: "choose snack",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/choose_snack.wav",
      text: "choose snack",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/choose_snack.wav",
      text: "choose snack",
    },
  },
  [normalizeText("Choose snack.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_tap_choice_c3bee111.wav",
      text: "Choose snack.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_tap_choice_c3bee111.wav",
      text: "Choose snack.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_tap_choice_c3bee111.wav",
      text: "Choose snack.",
    },
  },
  [normalizeText("choose story")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/choose_story.wav",
      text: "choose story",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/choose_story.wav",
      text: "choose story",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/choose_story.wav",
      text: "choose story",
    },
  },
  [normalizeText("Choose story.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_drag_choose_story_d7e6f1a1.wav",
      text: "Choose story.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_drag_choose_story_d7e6f1a1.wav",
      text: "Choose story.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_drag_choose_story_d7e6f1a1.wav",
      text: "Choose story.",
    },
  },
  [normalizeText("choose toy")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/choose_toy.wav",
      text: "choose toy",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/choose_toy.wav",
      text: "choose toy",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/choose_toy.wav",
      text: "choose toy",
    },
  },
  [normalizeText("Choose toy.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_tap_choice_970da0f2.wav",
      text: "Choose toy.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_tap_choice_970da0f2.wav",
      text: "Choose toy.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_tap_choice_970da0f2.wav",
      text: "Choose toy.",
    },
  },
  [normalizeText("Choosing a Bedtime Story is complete.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/completion_609440a1.wav",
      text: "Choosing a Bedtime Story is complete.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/completion_609440a1.wav",
      text: "Choosing a Bedtime Story is complete.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/completion_609440a1.wav",
      text: "Choosing a Bedtime Story is complete.",
    },
  },
  [normalizeText("Choosing a Snack is complete.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/completion_05187237.wav",
      text: "Choosing a Snack is complete.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/completion_05187237.wav",
      text: "Choosing a Snack is complete.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/completion_05187237.wav",
      text: "Choosing a Snack is complete.",
    },
  },
  [normalizeText("classroom")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/classroom.wav",
      text: "classroom",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/classroom.wav",
      text: "classroom",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/classroom.wav",
      text: "classroom",
    },
  },
  [normalizeText("Classroom is complete.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/completion_74426613.wav",
      text: "Classroom is complete.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/completion_74426613.wav",
      text: "Classroom is complete.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/completion_74426613.wav",
      text: "Classroom is complete.",
    },
  },
  [normalizeText("Clean the spot!")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_intro_9b09105c.wav",
      text: "Clean the spot!",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_intro_9b09105c.wav",
      text: "Clean the spot!",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_intro_9b09105c.wav",
      text: "Clean the spot!",
    },
  },
  [normalizeText("clean up")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/clean_up.wav",
      text: "clean up",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/clean_up.wav",
      text: "clean up",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/clean_up.wav",
      text: "clean up",
    },
  },
  [normalizeText("Clean Up After Lunch is complete.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/completion_d2a52b70.wav",
      text: "Clean Up After Lunch is complete.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/completion_d2a52b70.wav",
      text: "Clean Up After Lunch is complete.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/completion_d2a52b70.wav",
      text: "Clean Up After Lunch is complete.",
    },
  },
  [normalizeText("clean up toys")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/clean_up_toys.wav",
      text: "clean up toys",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/clean_up_toys.wav",
      text: "clean up toys",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/clean_up_toys.wav",
      text: "clean up toys",
    },
  },
  [normalizeText("Clean up toys!")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_intro_81aafc04.wav",
      text: "Clean up toys!",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_intro_81aafc04.wav",
      text: "Clean up toys!",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_intro_81aafc04.wav",
      text: "Clean up toys!",
    },
  },
  [normalizeText("Clean up toys.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_drag_toy_clean_up_09d7bc43.wav",
      text: "Clean up toys.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_toy_clean_up_09d7bc43.wav",
      text: "Clean up toys.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_drag_toy_clean_up_09d7bc43.wav",
      text: "Clean up toys.",
    },
  },
  [normalizeText("Clean up!")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_intro_27e13d82.wav",
      text: "Clean up!",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_intro_27e13d82.wav",
      text: "Clean up!",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_intro_27e13d82.wav",
      text: "Clean up!",
    },
  },
  [normalizeText("Clean up.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_drag_book_to_box_b9751a3d.wav",
      text: "Clean up.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_drag_book_to_box_b9751a3d.wav",
      text: "Clean up.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_drag_book_to_box_b9751a3d.wav",
      text: "Clean up.",
    },
  },
  [normalizeText("cleaning brush")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/cleaning_brush.wav",
      text: "cleaning brush",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/cleaning_brush.wav",
      text: "cleaning brush",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/cleaning_brush.wav",
      text: "cleaning brush",
    },
  },
  [normalizeText("Cleaning Spills and Spots is complete.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/completion_a94b7136.wav",
      text: "Cleaning Spills and Spots is complete.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/completion_a94b7136.wav",
      text: "Cleaning Spills and Spots is complete.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/completion_a94b7136.wav",
      text: "Cleaning Spills and Spots is complete.",
    },
  },
  [normalizeText("Cleaning Up After Snack is complete.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/completion_5f602d78.wav",
      text: "Cleaning Up After Snack is complete.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/completion_5f602d78.wav",
      text: "Cleaning Up After Snack is complete.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/completion_5f602d78.wav",
      text: "Cleaning Up After Snack is complete.",
    },
  },
  [normalizeText("Cleaning Up Toys is complete.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/completion_d8183ebd.wav",
      text: "Cleaning Up Toys is complete.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/completion_d8183ebd.wav",
      text: "Cleaning Up Toys is complete.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/completion_d8183ebd.wav",
      text: "Cleaning Up Toys is complete.",
    },
  },
  [normalizeText("Clear dinner!")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_intro_602ead8b.wav",
      text: "Clear dinner!",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_intro_602ead8b.wav",
      text: "Clear dinner!",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_intro_602ead8b.wav",
      text: "Clear dinner!",
    },
  },
  [normalizeText("Clearing Dinner Items is complete.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/completion_848bcc12.wav",
      text: "Clearing Dinner Items is complete.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/completion_848bcc12.wav",
      text: "Clearing Dinner Items is complete.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/completion_848bcc12.wav",
      text: "Clearing Dinner Items is complete.",
    },
  },
  [normalizeText("clock")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/clock.wav",
      text: "clock",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/clock.wav",
      text: "clock",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/clock.wav",
      text: "clock",
    },
  },
  [normalizeText("close curtains")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/close_curtains.wav",
      text: "close curtains",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/close_curtains.wav",
      text: "close curtains",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/close_curtains.wav",
      text: "close curtains",
    },
  },
  [normalizeText("cloth")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/cloth.wav",
      text: "cloth",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/cloth.wav",
      text: "cloth",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/cloth.wav",
      text: "cloth",
    },
  },
  [normalizeText("coaster")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/coaster.wav",
      text: "coaster",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/coaster.wav",
      text: "coaster",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/coaster.wav",
      text: "coaster",
    },
  },
  [normalizeText("comb")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/comb.wav",
      text: "comb",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/comb.wav",
      text: "comb",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/comb.wav",
      text: "comb",
    },
  },
  [normalizeText("comb hair")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/comb_hair.wav",
      text: "comb hair",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/comb_hair.wav",
      text: "comb hair",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/comb_hair.wav",
      text: "comb hair",
    },
  },
  [normalizeText("Comb hair.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_drag_comb_to_hair_8ab9838f.wav",
      text: "Comb hair.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_drag_comb_to_hair_8ab9838f.wav",
      text: "Comb hair.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_drag_comb_to_hair_8ab9838f.wav",
      text: "Comb hair.",
    },
  },
  [normalizeText("Comb.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_tap_comb_7ad7a253.wav",
      text: "Comb.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_tap_comb_7ad7a253.wav",
      text: "Comb.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_tap_comb_7ad7a253.wav",
      text: "Comb.",
    },
  },
  [normalizeText("comfort plush")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/comfort_plush.wav",
      text: "comfort plush",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/comfort_plush.wav",
      text: "comfort plush",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/comfort_plush.wav",
      text: "comfort plush",
    },
  },
  [normalizeText("compost bin")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/compost_bin.wav",
      text: "compost bin",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/compost_bin.wav",
      text: "compost bin",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/compost_bin.wav",
      text: "compost bin",
    },
  },
  [normalizeText("cookie")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/cookie.wav",
      text: "cookie",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/cookie.wav",
      text: "cookie",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/cookie.wav",
      text: "cookie",
    },
  },
  [normalizeText("cracker")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/cracker.wav",
      text: "cracker",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/cracker.wav",
      text: "cracker",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/cracker.wav",
      text: "cracker",
    },
  },
  [normalizeText("crayon")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/crayon.wav",
      text: "crayon",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/crayon.wav",
      text: "crayon",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/crayon.wav",
      text: "crayon",
    },
  },
  [normalizeText("Creative Play is complete.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/completion_137285c9.wav",
      text: "Creative Play is complete.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/completion_137285c9.wav",
      text: "Creative Play is complete.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/completion_137285c9.wav",
      text: "Creative Play is complete.",
    },
  },
  [normalizeText("Creative play!")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_intro_ce959a0e.wav",
      text: "Creative play!",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_intro_ce959a0e.wav",
      text: "Creative play!",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_intro_ce959a0e.wav",
      text: "Creative play!",
    },
  },
  [normalizeText("crumbs")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/crumbs.wav",
      text: "crumbs",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/crumbs.wav",
      text: "crumbs",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/crumbs.wav",
      text: "crumbs",
    },
  },
  [normalizeText("cup")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/cup.wav",
      text: "cup",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/cup.wav",
      text: "cup",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/cup.wav",
      text: "cup",
    },
  },
  [normalizeText("curtain")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/curtain.wav",
      text: "curtain",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/curtain.wav",
      text: "curtain",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/curtain.wav",
      text: "curtain",
    },
  },
  [normalizeText("desk")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/desk.wav",
      text: "desk",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/desk.wav",
      text: "desk",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/desk.wav",
      text: "desk",
    },
  },
  [normalizeText("dessert")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/dessert.wav",
      text: "dessert",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/dessert.wav",
      text: "dessert",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/dessert.wav",
      text: "dessert",
    },
  },
  [normalizeText("dim lights")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/dim_lights.wav",
      text: "dim lights",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/dim_lights.wav",
      text: "dim lights",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/dim_lights.wav",
      text: "dim lights",
    },
  },
  [normalizeText("dining light")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/dining_light.wav",
      text: "dining light",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/dining_light.wav",
      text: "dining light",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/dining_light.wav",
      text: "dining light",
    },
  },
  [normalizeText("dinner")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/dinner.wav",
      text: "dinner",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/dinner.wav",
      text: "dinner",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/dinner.wav",
      text: "dinner",
    },
  },
  [normalizeText("dinner bell")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/dinner_bell.wav",
      text: "dinner bell",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/dinner_bell.wav",
      text: "dinner bell",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/dinner_bell.wav",
      text: "dinner bell",
    },
  },
  [normalizeText("Dinner time!")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_intro_84cba5d2.wav",
      text: "Dinner time!",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_intro_84cba5d2.wav",
      text: "Dinner time!",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_intro_84cba5d2.wav",
      text: "Dinner time!",
    },
  },
  [normalizeText("dish rack")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/dish_rack.wav",
      text: "dish rack",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/dish_rack.wav",
      text: "dish rack",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/dish_rack.wav",
      text: "dish rack",
    },
  },
  [normalizeText("dishwasher")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/dishwasher.wav",
      text: "dishwasher",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/dishwasher.wav",
      text: "dishwasher",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/dishwasher.wav",
      text: "dishwasher",
    },
  },
  [normalizeText("doll")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/doll.wav",
      text: "doll",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/doll.wav",
      text: "doll",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/doll.wav",
      text: "doll",
    },
  },
  [normalizeText("door")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/door.wav",
      text: "door",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/door.wav",
      text: "door",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/door.wav",
      text: "door",
    },
  },
  [normalizeText("Drag the apple.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_drag_apple_0c14ba6f.wav",
      text: "Drag the apple.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_drag_apple_0c14ba6f.wav",
      text: "Drag the apple.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_drag_apple_0c14ba6f.wav",
      text: "Drag the apple.",
    },
  },
  [normalizeText("Drag the bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_drag_bag_d5e98051.wav",
      text: "Drag the bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_drag_bag_d5e98051.wav",
      text: "Drag the bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_drag_bag_d5e98051.wav",
      text: "Drag the bag.",
    },
  },
  [normalizeText("Drag the ball.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_drag_ball_to_yard_a0d3e1fe.wav",
      text: "Drag the ball.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_drag_ball_to_yard_a0d3e1fe.wav",
      text: "Drag the ball.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_drag_ball_to_yard_a0d3e1fe.wav",
      text: "Drag the ball.",
    },
  },
  [normalizeText("Drag the bath mat.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_drag_mat_to_bathtub_e103b98d.wav",
      text: "Drag the bath mat.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_drag_mat_to_bathtub_e103b98d.wav",
      text: "Drag the bath mat.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_drag_mat_to_bathtub_e103b98d.wav",
      text: "Drag the bath mat.",
    },
  },
  [normalizeText("Drag the blanket.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_blanket_539a01ab.wav",
      text: "Drag the blanket.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_blanket_539a01ab.wav",
      text: "Drag the blanket.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_blanket_539a01ab.wav",
      text: "Drag the blanket.",
    },
  },
  [normalizeText("Drag the blocks.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_drag_blocks_to_mat_b15da937.wav",
      text: "Drag the blocks.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_drag_blocks_to_mat_b15da937.wav",
      text: "Drag the blocks.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_drag_blocks_to_mat_b15da937.wav",
      text: "Drag the blocks.",
    },
  },
  [normalizeText("Drag the body wash.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_drag_body_wash_to_sponge_9cc21b19.wav",
      text: "Drag the body wash.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_drag_body_wash_to_sponge_9cc21b19.wav",
      text: "Drag the body wash.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_drag_body_wash_to_sponge_9cc21b19.wav",
      text: "Drag the body wash.",
    },
  },
  [normalizeText("Drag the book.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_drag_book_to_desk_5338289b.wav",
      text: "Drag the book.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_drag_book_to_desk_5338289b.wav",
      text: "Drag the book.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_drag_book_to_desk_5338289b.wav",
      text: "Drag the book.",
    },
  },
  [normalizeText("Drag the bookmark.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_drag_place_bookmark_8f127c78.wav",
      text: "Drag the bookmark.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_drag_place_bookmark_8f127c78.wav",
      text: "Drag the bookmark.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_drag_place_bookmark_8f127c78.wav",
      text: "Drag the bookmark.",
    },
  },
  [normalizeText("Drag the bottle.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_drag_bottle_to_mouth_91981ae7.wav",
      text: "Drag the bottle.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_drag_bottle_to_mouth_91981ae7.wav",
      text: "Drag the bottle.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_drag_bottle_to_mouth_91981ae7.wav",
      text: "Drag the bottle.",
    },
  },
  [normalizeText("Drag the bus.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_drag_bus_to_road_7397b97e.wav",
      text: "Drag the bus.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_drag_bus_to_road_7397b97e.wav",
      text: "Drag the bus.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_drag_bus_to_road_7397b97e.wav",
      text: "Drag the bus.",
    },
  },
  [normalizeText("Drag the car.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_drag_car_to_floor_a1411a32.wav",
      text: "Drag the car.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_drag_car_to_floor_a1411a32.wav",
      text: "Drag the car.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_drag_car_to_floor_a1411a32.wav",
      text: "Drag the car.",
    },
  },
  [normalizeText("Drag the carafe.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_drag_carafe_to_cart_e4bb2816.wav",
      text: "Drag the carafe.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_drag_carafe_to_cart_e4bb2816.wav",
      text: "Drag the carafe.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_drag_carafe_to_cart_e4bb2816.wav",
      text: "Drag the carafe.",
    },
  },
  [normalizeText("Drag the chair.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_drag_chair_to_desk_489a1613.wav",
      text: "Drag the chair.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_drag_chair_to_desk_489a1613.wav",
      text: "Drag the chair.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_drag_chair_to_desk_489a1613.wav",
      text: "Drag the chair.",
    },
  },
  [normalizeText("Drag the cleaning brush.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_drag_brush_to_spill_173bd8b4.wav",
      text: "Drag the cleaning brush.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_drag_brush_to_spill_173bd8b4.wav",
      text: "Drag the cleaning brush.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_drag_brush_to_spill_173bd8b4.wav",
      text: "Drag the cleaning brush.",
    },
  },
  [normalizeText("Drag the coaster.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_drag_coaster_to_cart_b77e9f81.wav",
      text: "Drag the coaster.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_drag_coaster_to_cart_b77e9f81.wav",
      text: "Drag the coaster.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_drag_coaster_to_cart_b77e9f81.wav",
      text: "Drag the coaster.",
    },
  },
  [normalizeText("Drag the cookie.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_drag_cookie_to_snack_8695bbdb.wav",
      text: "Drag the cookie.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_drag_cookie_to_snack_8695bbdb.wav",
      text: "Drag the cookie.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_drag_cookie_to_snack_8695bbdb.wav",
      text: "Drag the cookie.",
    },
  },
  [normalizeText("Drag the cracker.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_drag_cracker_to_table_9270b721.wav",
      text: "Drag the cracker.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_drag_cracker_to_table_9270b721.wav",
      text: "Drag the cracker.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_drag_cracker_to_table_9270b721.wav",
      text: "Drag the cracker.",
    },
  },
  [normalizeText("Drag the crayon.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_drag_crayon_to_paper_5ae17541.wav",
      text: "Drag the crayon.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_drag_crayon_to_paper_5ae17541.wav",
      text: "Drag the crayon.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_drag_crayon_to_paper_5ae17541.wav",
      text: "Drag the crayon.",
    },
  },
  [normalizeText("Drag the crumbs.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_drag_crumbs_to_trash_f6335662.wav",
      text: "Drag the crumbs.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_drag_crumbs_to_trash_f6335662.wav",
      text: "Drag the crumbs.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_drag_crumbs_to_trash_f6335662.wav",
      text: "Drag the crumbs.",
    },
  },
  [normalizeText("Drag the curtain.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_drag_close_curtains_82084aca.wav",
      text: "Drag the curtain.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_drag_close_curtains_82084aca.wav",
      text: "Drag the curtain.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_drag_close_curtains_82084aca.wav",
      text: "Drag the curtain.",
    },
  },
  [normalizeText("Drag the dirty clothes.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_drag_clothes_to_basket_d32dcc9f.wav",
      text: "Drag the dirty clothes.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_drag_clothes_to_basket_d32dcc9f.wav",
      text: "Drag the dirty clothes.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_drag_clothes_to_basket_d32dcc9f.wav",
      text: "Drag the dirty clothes.",
    },
  },
  [normalizeText("Drag the drying mat.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_drag_drying_mat_6636ff28.wav",
      text: "Drag the drying mat.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_drag_drying_mat_6636ff28.wav",
      text: "Drag the drying mat.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_drag_drying_mat_6636ff28.wav",
      text: "Drag the drying mat.",
    },
  },
  [normalizeText("Drag the food cover.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_drag_cover_to_leftovers_36e58fba.wav",
      text: "Drag the food cover.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_cover_to_leftovers_36e58fba.wav",
      text: "Drag the food cover.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_drag_cover_to_leftovers_36e58fba.wav",
      text: "Drag the food cover.",
    },
  },
  [normalizeText("Drag the fruit.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_drag_fruit_to_table_276a8842.wav",
      text: "Drag the fruit.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_drag_fruit_to_table_276a8842.wav",
      text: "Drag the fruit.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_drag_fruit_to_table_276a8842.wav",
      text: "Drag the fruit.",
    },
  },
  [normalizeText("Drag the glow sticker.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_drag_glow_sticker_882cb6fb.wav",
      text: "Drag the glow sticker.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_drag_glow_sticker_882cb6fb.wav",
      text: "Drag the glow sticker.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_drag_glow_sticker_882cb6fb.wav",
      text: "Drag the glow sticker.",
    },
  },
  [normalizeText("Drag the humidifier.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_drag_humidifier_23edc1cd.wav",
      text: "Drag the humidifier.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_drag_humidifier_23edc1cd.wav",
      text: "Drag the humidifier.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_drag_humidifier_23edc1cd.wav",
      text: "Drag the humidifier.",
    },
  },
  [normalizeText("Drag the kite.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_drag_kite_to_sky_1061084e.wav",
      text: "Drag the kite.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_drag_kite_to_sky_1061084e.wav",
      text: "Drag the kite.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_drag_kite_to_sky_1061084e.wav",
      text: "Drag the kite.",
    },
  },
  [normalizeText("Drag the ladle.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_drag_ladle_to_tray_be05cb93.wav",
      text: "Drag the ladle.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_drag_ladle_to_tray_be05cb93.wav",
      text: "Drag the ladle.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_drag_ladle_to_tray_be05cb93.wav",
      text: "Drag the ladle.",
    },
  },
  [normalizeText("Drag the leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_drag_leftovers_to_counter_7a9202c7.wav",
      text: "Drag the leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_leftovers_to_counter_7a9202c7.wav",
      text: "Drag the leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_drag_leftovers_to_counter_7a9202c7.wav",
      text: "Drag the leftovers.",
    },
  },
  [normalizeText("Drag the napkin.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_drag_napkin_to_table_81d12a33.wav",
      text: "Drag the napkin.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_drag_napkin_to_table_81d12a33.wav",
      text: "Drag the napkin.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_drag_napkin_to_table_81d12a33.wav",
      text: "Drag the napkin.",
    },
  },
  [normalizeText("Drag the noodles.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_drag_noodles_to_meal_511d65bd.wav",
      text: "Drag the noodles.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_drag_noodles_to_meal_511d65bd.wav",
      text: "Drag the noodles.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_drag_noodles_to_meal_511d65bd.wav",
      text: "Drag the noodles.",
    },
  },
  [normalizeText("Drag the page tab.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_drag_page_tab_8e1863fa.wav",
      text: "Drag the page tab.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_drag_page_tab_8e1863fa.wav",
      text: "Drag the page tab.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_drag_page_tab_8e1863fa.wav",
      text: "Drag the page tab.",
    },
  },
  [normalizeText("Drag the pencil.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_drag_pencil_to_table_3a7b5b0f.wav",
      text: "Drag the pencil.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_drag_pencil_to_table_3a7b5b0f.wav",
      text: "Drag the pencil.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_drag_pencil_to_table_3a7b5b0f.wav",
      text: "Drag the pencil.",
    },
  },
  [normalizeText("Drag the placemat.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_drag_placemat_to_spot_5aaab2bc.wav",
      text: "Drag the placemat.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_drag_placemat_to_spot_5aaab2bc.wav",
      text: "Drag the placemat.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_drag_placemat_to_spot_5aaab2bc.wav",
      text: "Drag the placemat.",
    },
  },
  [normalizeText("Drag the ruler.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_drag_ruler_to_paper_b4add533.wav",
      text: "Drag the ruler.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_drag_ruler_to_paper_b4add533.wav",
      text: "Drag the ruler.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_drag_ruler_to_paper_b4add533.wav",
      text: "Drag the ruler.",
    },
  },
  [normalizeText("Drag the salad.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_drag_salad_to_meal_510157dc.wav",
      text: "Drag the salad.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_drag_salad_to_meal_510157dc.wav",
      text: "Drag the salad.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_drag_salad_to_meal_510157dc.wav",
      text: "Drag the salad.",
    },
  },
  [normalizeText("Drag the seat belt.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_drag_seat_belt_to_seat_d6b931bd.wav",
      text: "Drag the seat belt.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_drag_seat_belt_to_seat_d6b931bd.wav",
      text: "Drag the seat belt.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_drag_seat_belt_to_seat_d6b931bd.wav",
      text: "Drag the seat belt.",
    },
  },
  [normalizeText("Drag the shoes.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_drag_shoes_to_door_b9759a63.wav",
      text: "Drag the shoes.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_drag_shoes_to_door_b9759a63.wav",
      text: "Drag the shoes.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_drag_shoes_to_door_b9759a63.wav",
      text: "Drag the shoes.",
    },
  },
  [normalizeText("Drag the sleep mask.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_drag_mask_to_nightstand_ced7e8b1.wav",
      text: "Drag the sleep mask.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_drag_mask_to_nightstand_ced7e8b1.wav",
      text: "Drag the sleep mask.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_drag_mask_to_nightstand_ced7e8b1.wav",
      text: "Drag the sleep mask.",
    },
  },
  [normalizeText("Drag the slippers.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_drag_slippers_to_feet_996f293d.wav",
      text: "Drag the slippers.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_drag_slippers_to_feet_996f293d.wav",
      text: "Drag the slippers.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_drag_slippers_to_feet_996f293d.wav",
      text: "Drag the slippers.",
    },
  },
  [normalizeText("Drag the snack.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_drag_snack_to_table_a8eaea19.wav",
      text: "Drag the snack.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_drag_snack_to_table_a8eaea19.wav",
      text: "Drag the snack.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_drag_snack_to_table_a8eaea19.wav",
      text: "Drag the snack.",
    },
  },
  [normalizeText("Drag the soap.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_drag_soap_to_hand_f7579393.wav",
      text: "Drag the soap.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_drag_soap_to_hand_f7579393.wav",
      text: "Drag the soap.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_drag_soap_to_hand_f7579393.wav",
      text: "Drag the soap.",
    },
  },
  [normalizeText("Drag the sound machine.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_drag_sound_machine_a2676633.wav",
      text: "Drag the sound machine.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_drag_sound_machine_a2676633.wav",
      text: "Drag the sound machine.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_drag_sound_machine_a2676633.wav",
      text: "Drag the sound machine.",
    },
  },
  [normalizeText("Drag the soup.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_drag_soup_to_bowl_ee8487fe.wav",
      text: "Drag the soup.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_drag_soup_to_bowl_ee8487fe.wav",
      text: "Drag the soup.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_drag_soup_to_bowl_ee8487fe.wav",
      text: "Drag the soup.",
    },
  },
  [normalizeText("Drag the spoon.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_drag_spoon_to_soup_134ecdd6.wav",
      text: "Drag the spoon.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_drag_spoon_to_soup_134ecdd6.wav",
      text: "Drag the spoon.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_drag_spoon_to_soup_134ecdd6.wav",
      text: "Drag the spoon.",
    },
  },
  [normalizeText("Drag the storybook.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_drag_storybook_to_nook_04438fb7.wav",
      text: "Drag the storybook.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_drag_storybook_to_nook_04438fb7.wav",
      text: "Drag the storybook.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_drag_storybook_to_nook_04438fb7.wav",
      text: "Drag the storybook.",
    },
  },
  [normalizeText("Drag the straw.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_drag_straw_to_juice_67afbbeb.wav",
      text: "Drag the straw.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_drag_straw_to_juice_67afbbeb.wav",
      text: "Drag the straw.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_drag_straw_to_juice_67afbbeb.wav",
      text: "Drag the straw.",
    },
  },
  [normalizeText("Drag the toothbrush.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_drag_toothbrush_c70cc9e9.wav",
      text: "Drag the toothbrush.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_drag_toothbrush_c70cc9e9.wav",
      text: "Drag the toothbrush.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_drag_toothbrush_c70cc9e9.wav",
      text: "Drag the toothbrush.",
    },
  },
  [normalizeText("Drag the towel.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_drag_towel_to_face_a55eae98.wav",
      text: "Drag the towel.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_drag_towel_to_face_a55eae98.wav",
      text: "Drag the towel.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_drag_towel_to_face_a55eae98.wav",
      text: "Drag the towel.",
    },
  },
  [normalizeText("Drag the toy.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_drag_toy_to_basket_d6e687c7.wav",
      text: "Drag the toy.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_toy_to_basket_d6e687c7.wav",
      text: "Drag the toy.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_drag_toy_to_basket_d6e687c7.wav",
      text: "Drag the toy.",
    },
  },
  [normalizeText("Drag the wrapper.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_drag_wrapper_to_tray_52b58ade.wav",
      text: "Drag the wrapper.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_wrapper_to_tray_52b58ade.wav",
      text: "Drag the wrapper.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_drag_wrapper_to_tray_52b58ade.wav",
      text: "Drag the wrapper.",
    },
  },
  [normalizeText("draw a circle")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/draw_a_circle.wav",
      text: "draw a circle",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/draw_a_circle.wav",
      text: "draw a circle",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/draw_a_circle.wav",
      text: "draw a circle",
    },
  },
  [normalizeText("Draw a circle.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_drag_crayon_to_paper_47aa2b73.wav",
      text: "Draw a circle.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_drag_crayon_to_paper_47aa2b73.wav",
      text: "Draw a circle.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_drag_crayon_to_paper_47aa2b73.wav",
      text: "Draw a circle.",
    },
  },
  [normalizeText("draw picture")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/draw_picture.wav",
      text: "draw picture",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/draw_picture.wav",
      text: "draw picture",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/draw_picture.wav",
      text: "draw picture",
    },
  },
  [normalizeText("Draw picture.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_drag_crayon_draw_3904876b.wav",
      text: "Draw picture.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_drag_crayon_draw_3904876b.wav",
      text: "Draw picture.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_drag_crayon_draw_3904876b.wav",
      text: "Draw picture.",
    },
  },
  [normalizeText("dream journal")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/dream_journal.wav",
      text: "dream journal",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/dream_journal.wav",
      text: "dream journal",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/dream_journal.wav",
      text: "dream journal",
    },
  },
  [normalizeText("drink water")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/drink_water.wav",
      text: "drink water",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/drink_water.wav",
      text: "drink water",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/drink_water.wav",
      text: "drink water",
    },
  },
  [normalizeText("drum")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/drum.wav",
      text: "drum",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/drum.wav",
      text: "drum",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/drum.wav",
      text: "drum",
    },
  },
  [normalizeText("dry face")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/dry_face.wav",
      text: "dry face",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/dry_face.wav",
      text: "dry face",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/dry_face.wav",
      text: "dry face",
    },
  },
  [normalizeText("Dry face.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_review_towel_cbfcf58e.wav",
      text: "Dry face.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_review_towel_cbfcf58e.wav",
      text: "Dry face.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_review_towel_cbfcf58e.wav",
      text: "Dry face.",
    },
  },
  [normalizeText("dry surface")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/dry_surface.wav",
      text: "dry surface",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/dry_surface.wav",
      text: "dry surface",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/dry_surface.wav",
      text: "dry surface",
    },
  },
  [normalizeText("Dry surface.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_tap_dry_surface_2cb4d434.wav",
      text: "Dry surface.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_tap_dry_surface_2cb4d434.wav",
      text: "Dry surface.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_tap_dry_surface_2cb4d434.wav",
      text: "Dry surface.",
    },
  },
  [normalizeText("drying mat")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/drying_mat.wav",
      text: "drying mat",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/drying_mat.wav",
      text: "drying mat",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/drying_mat.wav",
      text: "drying mat",
    },
  },
  [normalizeText("eat breakfast")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/eat_breakfast.wav",
      text: "eat breakfast",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/eat_breakfast.wav",
      text: "eat breakfast",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/eat_breakfast.wav",
      text: "eat breakfast",
    },
  },
  [normalizeText("Eat breakfast.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_drag_bread_to_mouth_2c7c5c4c.wav",
      text: "Eat breakfast.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_drag_bread_to_mouth_2c7c5c4c.wav",
      text: "Eat breakfast.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_drag_bread_to_mouth_2c7c5c4c.wav",
      text: "Eat breakfast.",
    },
  },
  [normalizeText("eat lunch")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/eat_lunch.wav",
      text: "eat lunch",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/eat_lunch.wav",
      text: "eat lunch",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/eat_lunch.wav",
      text: "eat lunch",
    },
  },
  [normalizeText("Eat lunch.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_drag_rice_to_mouth_73d6ff84.wav",
      text: "Eat lunch.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_drag_rice_to_mouth_73d6ff84.wav",
      text: "Eat lunch.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_drag_rice_to_mouth_73d6ff84.wav",
      text: "Eat lunch.",
    },
  },
  [normalizeText("eat snack")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/eat_snack.wav",
      text: "eat snack",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/eat_snack.wav",
      text: "eat snack",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/eat_snack.wav",
      text: "eat snack",
    },
  },
  [normalizeText("Eat snack.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_drag_snack_to_mouth_a4b54014.wav",
      text: "Eat snack.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_drag_snack_to_mouth_a4b54014.wav",
      text: "Eat snack.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_drag_snack_to_mouth_a4b54014.wav",
      text: "Eat snack.",
    },
  },
  [normalizeText("Eating a Snack Neatly is complete.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/completion_b65fff7f.wav",
      text: "Eating a Snack Neatly is complete.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/completion_b65fff7f.wav",
      text: "Eating a Snack Neatly is complete.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/completion_b65fff7f.wav",
      text: "Eating a Snack Neatly is complete.",
    },
  },
  [normalizeText("egg")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/egg.wav",
      text: "egg",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/egg.wav",
      text: "egg",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/egg.wav",
      text: "egg",
    },
  },
  [normalizeText("elbow")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/elbow.wav",
      text: "elbow",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/elbow.wav",
      text: "elbow",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/elbow.wav",
      text: "elbow",
    },
  },
  [normalizeText("eraser")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/eraser.wav",
      text: "eraser",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/eraser.wav",
      text: "eraser",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/eraser.wav",
      text: "eraser",
    },
  },
  [normalizeText("family")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/family.wav",
      text: "family",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/family.wav",
      text: "family",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/family.wav",
      text: "family",
    },
  },
  [normalizeText("Family dinner!")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_intro_aa615adb.wav",
      text: "Family dinner!",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_intro_aa615adb.wav",
      text: "Family dinner!",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_intro_aa615adb.wav",
      text: "Family dinner!",
    },
  },
  [normalizeText("Find two matching pictures.")]: {
    "en-US": {
      key: "shared/audio/en-US/neural2-c-r1/memory_game_intro_2480d4dc.wav",
      text: "Find two matching pictures.",
    },
    "en-GB": {
      key: "shared/audio/en-GB/neural2-c-r1/memory_game_intro_2480d4dc.wav",
      text: "Find two matching pictures.",
    },
    legacy: {
      key: "shared/audio/en/memory_game_intro_2480d4dc.wav",
      text: "Find two matching pictures.",
    },
  },
  [normalizeText("fish")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/fish.wav",
      text: "fish",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/fish.wav",
      text: "fish",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/fish.wav",
      text: "fish",
    },
  },
  [normalizeText("floor")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/floor.wav",
      text: "floor",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/floor.wav",
      text: "floor",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/floor.wav",
      text: "floor",
    },
  },
  [normalizeText("foam")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/foam.wav",
      text: "foam",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/foam.wav",
      text: "foam",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/foam.wav",
      text: "foam",
    },
  },
  [normalizeText("folder")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/folder.wav",
      text: "folder",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/folder.wav",
      text: "folder",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/folder.wav",
      text: "folder",
    },
  },
  [normalizeText("food cover")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/food_cover.wav",
      text: "food cover",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/food_cover.wav",
      text: "food cover",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/food_cover.wav",
      text: "food cover",
    },
  },
  [normalizeText("fork")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/fork.wav",
      text: "fork",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/fork.wav",
      text: "fork",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/fork.wav",
      text: "fork",
    },
  },
  [normalizeText("friend")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/friend.wav",
      text: "friend",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/friend.wav",
      text: "friend",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/friend.wav",
      text: "friend",
    },
  },
  [normalizeText("fruit")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/fruit.wav",
      text: "fruit",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/fruit.wav",
      text: "fruit",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/fruit.wav",
      text: "fruit",
    },
  },
  [normalizeText("Games with Friends is complete.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/completion_709bf819.wav",
      text: "Games with Friends is complete.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/completion_709bf819.wav",
      text: "Games with Friends is complete.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/completion_709bf819.wav",
      text: "Games with Friends is complete.",
    },
  },
  [normalizeText("get on bus")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/get_on_bus.wav",
      text: "get on bus",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/get_on_bus.wav",
      text: "get on bus",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/get_on_bus.wav",
      text: "get on bus",
    },
  },
  [normalizeText("Get on bus.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_tap_bus_door_eafff757.wav",
      text: "Get on bus.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_tap_bus_door_eafff757.wav",
      text: "Get on bus.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_tap_bus_door_eafff757.wav",
      text: "Get on bus.",
    },
  },
  [normalizeText("Getting Dinner Ready is complete.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/completion_37a01c46.wav",
      text: "Getting Dinner Ready is complete.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/completion_37a01c46.wav",
      text: "Getting Dinner Ready is complete.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/completion_37a01c46.wav",
      text: "Getting Dinner Ready is complete.",
    },
  },
  [normalizeText("Getting Ready for a Bath is complete.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/completion_58a0f9fd.wav",
      text: "Getting Ready for a Bath is complete.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/completion_58a0f9fd.wav",
      text: "Getting Ready for a Bath is complete.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/completion_58a0f9fd.wav",
      text: "Getting Ready for a Bath is complete.",
    },
  },
  [normalizeText("Getting Ready to Go Home is complete.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/completion_72080f62.wav",
      text: "Getting Ready to Go Home is complete.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/completion_72080f62.wav",
      text: "Getting Ready to Go Home is complete.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/completion_72080f62.wav",
      text: "Getting Ready to Go Home is complete.",
    },
  },
  [normalizeText("Getting Ready to Sleep is complete.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/completion_56c87249.wav",
      text: "Getting Ready to Sleep is complete.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/completion_56c87249.wav",
      text: "Getting Ready to Sleep is complete.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/completion_56c87249.wav",
      text: "Getting Ready to Sleep is complete.",
    },
  },
  [normalizeText("glow sticker")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/glow_sticker.wav",
      text: "glow sticker",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/glow_sticker.wav",
      text: "glow sticker",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/glow_sticker.wav",
      text: "glow sticker",
    },
  },
  [normalizeText("go to school")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/go_to_school.wav",
      text: "go to school",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/go_to_school.wav",
      text: "go to school",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/go_to_school.wav",
      text: "go to school",
    },
  },
  [normalizeText("Go to School is complete.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/completion_1d566fdc.wav",
      text: "Go to School is complete.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/completion_1d566fdc.wav",
      text: "Go to School is complete.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/completion_1d566fdc.wav",
      text: "Go to School is complete.",
    },
  },
  [normalizeText("Go to school!")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_intro_faa281fa.wav",
      text: "Go to school!",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_intro_faa281fa.wav",
      text: "Go to school!",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_intro_faa281fa.wav",
      text: "Go to school!",
    },
  },
  [normalizeText("Going home!")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_intro_9dbc530d.wav",
      text: "Going home!",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_intro_9dbc530d.wav",
      text: "Going home!",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_intro_9dbc530d.wav",
      text: "Going home!",
    },
  },
  [normalizeText("good morning")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/good_morning.wav",
      text: "good morning",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/good_morning.wav",
      text: "good morning",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/good_morning.wav",
      text: "good morning",
    },
  },
  [normalizeText("Good morning!")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_intro_bfba329f.wav",
      text: "Good morning!",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_intro_bfba329f.wav",
      text: "Good morning!",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_intro_bfba329f.wav",
      text: "Good morning!",
    },
  },
  [normalizeText("Great job!")]: {
    "en-US": {
      key: "shared/audio/en-US/neural2-c-r1/feedback_success_fcd6d5ea.wav",
      text: "Great job!",
    },
    "en-GB": {
      key: "shared/audio/en-GB/neural2-c-r1/feedback_success_fcd6d5ea.wav",
      text: "Great job!",
    },
    legacy: {
      key: "shared/audio/en/feedback_success_fcd6d5ea.wav",
      text: "Great job!",
    },
  },
  [normalizeText("hang robe")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/hang_robe.wav",
      text: "hang robe",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/hang_robe.wav",
      text: "hang robe",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/hang_robe.wav",
      text: "hang robe",
    },
  },
  [normalizeText("Hang robe.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_drag_robe_to_hook_604e411e.wav",
      text: "Hang robe.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_drag_robe_to_hook_604e411e.wav",
      text: "Hang robe.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_drag_robe_to_hook_604e411e.wav",
      text: "Hang robe.",
    },
  },
  [normalizeText("home")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/home.wav",
      text: "home",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/home.wav",
      text: "home",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/home.wav",
      text: "home",
    },
  },
  [normalizeText("Home!")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_intro_d66a83e1.wav",
      text: "Home!",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_intro_d66a83e1.wav",
      text: "Home!",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_intro_d66a83e1.wav",
      text: "Home!",
    },
  },
  [normalizeText("hook")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/hook.wav",
      text: "hook",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/hook.wav",
      text: "hook",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/hook.wav",
      text: "hook",
    },
  },
  [normalizeText("hug comfort plush")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/hug_comfort_plush.wav",
      text: "hug comfort plush",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/hug_comfort_plush.wav",
      text: "hug comfort plush",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/hug_comfort_plush.wav",
      text: "hug comfort plush",
    },
  },
  [normalizeText("Hug comfort plush.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_drag_hug_comfort_plush_ca2ec3ef.wav",
      text: "Hug comfort plush.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_drag_hug_comfort_plush_ca2ec3ef.wav",
      text: "Hug comfort plush.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_drag_hug_comfort_plush_ca2ec3ef.wav",
      text: "Hug comfort plush.",
    },
  },
  [normalizeText("hug family")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/hug_family.wav",
      text: "hug family",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/hug_family.wav",
      text: "hug family",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/hug_family.wav",
      text: "hug family",
    },
  },
  [normalizeText("Hug family.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_tap_family_hug_d22a60ba.wav",
      text: "Hug family.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_tap_family_hug_d22a60ba.wav",
      text: "Hug family.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_tap_family_hug_d22a60ba.wav",
      text: "Hug family.",
    },
  },
  [normalizeText("humidifier")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/humidifier.wav",
      text: "humidifier",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/humidifier.wav",
      text: "humidifier",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/humidifier.wav",
      text: "humidifier",
    },
  },
  [normalizeText("I heard you! Great job!")]: {
    "en-US": {
      key: "shared/audio/en-US/neural2-c-r1/recording_encouragement_8731bb5d.wav",
      text: "I heard you! Great job!",
    },
    "en-GB": {
      key: "shared/audio/en-GB/neural2-c-r1/recording_encouragement_8731bb5d.wav",
      text: "I heard you! Great job!",
    },
    legacy: {
      key: "shared/audio/en/recording_encouragement_8731bb5d.wav",
      text: "I heard you! Great job!",
    },
  },
  [normalizeText("It means air dry dishes.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_air_dry_dishes_success_890b3406.wav",
      text: "It means air dry dishes.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_air_dry_dishes_success_890b3406.wav",
      text: "It means air dry dishes.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_air_dry_dishes_success_890b3406.wav",
      text: "It means air dry dishes.",
    },
  },
  [normalizeText("It means apple.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_apple_success_b734b1ed.wav",
      text: "It means apple.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_apple_success_b734b1ed.wav",
      text: "It means apple.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_apple_success_b734b1ed.wav",
      text: "It means apple.",
    },
  },
  [normalizeText("It means apron.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_apron_success_a021f531.wav",
      text: "It means apron.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_apron_success_a021f531.wav",
      text: "It means apron.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_apron_success_a021f531.wav",
      text: "It means apron.",
    },
  },
  [normalizeText("It means arrive home.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_arrive_home_success_e6e44047.wav",
      text: "It means arrive home.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_arrive_home_success_e6e44047.wav",
      text: "It means arrive home.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_arrive_home_success_e6e44047.wav",
      text: "It means arrive home.",
    },
  },
  [normalizeText("It means bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_bag_success_fe006b73.wav",
      text: "It means bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_bag_success_fe006b73.wav",
      text: "It means bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_bag_success_fe006b73.wav",
      text: "It means bag.",
    },
  },
  [normalizeText("It means ball.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_ball_success_333bbdda.wav",
      text: "It means ball.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_ball_success_333bbdda.wav",
      text: "It means ball.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_ball_success_333bbdda.wav",
      text: "It means ball.",
    },
  },
  [normalizeText("It means banana.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_banana_success_20cda1aa.wav",
      text: "It means banana.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_banana_success_20cda1aa.wav",
      text: "It means banana.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_banana_success_20cda1aa.wav",
      text: "It means banana.",
    },
  },
  [normalizeText("It means basket.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/teach_basket_success_a5c34da9.wav",
      text: "It means basket.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/teach_basket_success_a5c34da9.wav",
      text: "It means basket.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/teach_basket_success_a5c34da9.wav",
      text: "It means basket.",
    },
  },
  [normalizeText("It means bath mat.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_bath_mat_success_29b43749.wav",
      text: "It means bath mat.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_bath_mat_success_29b43749.wav",
      text: "It means bath mat.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_bath_mat_success_29b43749.wav",
      text: "It means bath mat.",
    },
  },
  [normalizeText("It means bath sponge.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_bath_sponge_success_4fcd724d.wav",
      text: "It means bath sponge.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_bath_sponge_success_4fcd724d.wav",
      text: "It means bath sponge.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_bath_sponge_success_4fcd724d.wav",
      text: "It means bath sponge.",
    },
  },
  [normalizeText("It means bathtub.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_bathtub_success_dd47c89c.wav",
      text: "It means bathtub.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_bathtub_success_dd47c89c.wav",
      text: "It means bathtub.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_bathtub_success_dd47c89c.wav",
      text: "It means bathtub.",
    },
  },
  [normalizeText("It means bed.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_bed_success_8bdc28c3.wav",
      text: "It means bed.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_bed_success_8bdc28c3.wav",
      text: "It means bed.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_bed_success_8bdc28c3.wav",
      text: "It means bed.",
    },
  },
  [normalizeText("It means bench.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_bench_success_ff9b8cc0.wav",
      text: "It means bench.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_bench_success_ff9b8cc0.wav",
      text: "It means bench.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_bench_success_ff9b8cc0.wav",
      text: "It means bench.",
    },
  },
  [normalizeText("It means bite.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_bite_success_d5761872.wav",
      text: "It means bite.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_bite_success_d5761872.wav",
      text: "It means bite.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_bite_success_d5761872.wav",
      text: "It means bite.",
    },
  },
  [normalizeText("It means blanket.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_blanket_success_9b17050e.wav",
      text: "It means blanket.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_blanket_success_9b17050e.wav",
      text: "It means blanket.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_blanket_success_9b17050e.wav",
      text: "It means blanket.",
    },
  },
  [normalizeText("It means blocks.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_blocks_success_49678b0a.wav",
      text: "It means blocks.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_blocks_success_49678b0a.wav",
      text: "It means blocks.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_blocks_success_49678b0a.wav",
      text: "It means blocks.",
    },
  },
  [normalizeText("It means board.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_board_success_0335cdc0.wav",
      text: "It means board.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_board_success_0335cdc0.wav",
      text: "It means board.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_board_success_0335cdc0.wav",
      text: "It means board.",
    },
  },
  [normalizeText("It means body wash.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_body_wash_success_88f227a9.wav",
      text: "It means body wash.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_body_wash_success_88f227a9.wav",
      text: "It means body wash.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_body_wash_success_88f227a9.wav",
      text: "It means body wash.",
    },
  },
  [normalizeText("It means book.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_book_success_a38c468a.wav",
      text: "It means book.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_book_success_a38c468a.wav",
      text: "It means book.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_book_success_a38c468a.wav",
      text: "It means book.",
    },
  },
  [normalizeText("It means bookmark.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_bookmark_success_394600ec.wav",
      text: "It means bookmark.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_bookmark_success_394600ec.wav",
      text: "It means bookmark.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_bookmark_success_394600ec.wav",
      text: "It means bookmark.",
    },
  },
  [normalizeText("It means bottle.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_bottle_success_d184aeb0.wav",
      text: "It means bottle.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_bottle_success_d184aeb0.wav",
      text: "It means bottle.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_bottle_success_d184aeb0.wav",
      text: "It means bottle.",
    },
  },
  [normalizeText("It means bowl.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_bowl_success_7e0ff003.wav",
      text: "It means bowl.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_bowl_success_7e0ff003.wav",
      text: "It means bowl.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_bowl_success_7e0ff003.wav",
      text: "It means bowl.",
    },
  },
  [normalizeText("It means box.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_box_success_856f0a3c.wav",
      text: "It means box.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_box_success_856f0a3c.wav",
      text: "It means box.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_box_success_856f0a3c.wav",
      text: "It means box.",
    },
  },
  [normalizeText("It means brush teeth.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_brush_teeth_success_96ca43f8.wav",
      text: "It means brush teeth.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_brush_teeth_success_96ca43f8.wav",
      text: "It means brush teeth.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_brush_teeth_success_96ca43f8.wav",
      text: "It means brush teeth.",
    },
  },
  [normalizeText("It means bubble.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_bubble_success_29604ff9.wav",
      text: "It means bubble.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_bubble_success_29604ff9.wav",
      text: "It means bubble.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_bubble_success_29604ff9.wav",
      text: "It means bubble.",
    },
  },
  [normalizeText("It means bucket.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_bucket_success_62b6ad79.wav",
      text: "It means bucket.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_bucket_success_62b6ad79.wav",
      text: "It means bucket.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_bucket_success_62b6ad79.wav",
      text: "It means bucket.",
    },
  },
  [normalizeText("It means buckle up.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_buckle_up_success_c3b84bcd.wav",
      text: "It means buckle up.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_buckle_up_success_c3b84bcd.wav",
      text: "It means buckle up.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_buckle_up_success_c3b84bcd.wav",
      text: "It means buckle up.",
    },
  },
  [normalizeText("It means build tower.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/teach_build_tower_success_720c5227.wav",
      text: "It means build tower.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/teach_build_tower_success_720c5227.wav",
      text: "It means build tower.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/teach_build_tower_success_720c5227.wav",
      text: "It means build tower.",
    },
  },
  [normalizeText("It means bus.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_bus_success_56376550.wav",
      text: "It means bus.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_bus_success_56376550.wav",
      text: "It means bus.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_bus_success_56376550.wav",
      text: "It means bus.",
    },
  },
  [normalizeText("It means cabinet.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_cabinet_success_b9bf73bb.wav",
      text: "It means cabinet.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_cabinet_success_b9bf73bb.wav",
      text: "It means cabinet.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_cabinet_success_b9bf73bb.wav",
      text: "It means cabinet.",
    },
  },
  [normalizeText("It means call everyone.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_call_everyone_success_1526dff2.wav",
      text: "It means call everyone.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_call_everyone_success_1526dff2.wav",
      text: "It means call everyone.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_call_everyone_success_1526dff2.wav",
      text: "It means call everyone.",
    },
  },
  [normalizeText("It means car.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/teach_car_success_ad293b5b.wav",
      text: "It means car.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/teach_car_success_ad293b5b.wav",
      text: "It means car.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/teach_car_success_ad293b5b.wav",
      text: "It means car.",
    },
  },
  [normalizeText("It means carafe.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_carafe_success_5cb3a4b9.wav",
      text: "It means carafe.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_carafe_success_5cb3a4b9.wav",
      text: "It means carafe.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_carafe_success_5cb3a4b9.wav",
      text: "It means carafe.",
    },
  },
  [normalizeText("It means carry tray.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_carry_tray_success_161abf37.wav",
      text: "It means carry tray.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_carry_tray_success_161abf37.wav",
      text: "It means carry tray.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_carry_tray_success_161abf37.wav",
      text: "It means carry tray.",
    },
  },
  [normalizeText("It means chair.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_chair_success_8542052f.wav",
      text: "It means chair.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_chair_success_8542052f.wav",
      text: "It means chair.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_chair_success_8542052f.wav",
      text: "It means chair.",
    },
  },
  [normalizeText("It means check dream journal.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_check_dream_journal_success_250b2632.wav",
      text: "It means check dream journal.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_check_dream_journal_success_250b2632.wav",
      text: "It means check dream journal.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_check_dream_journal_success_250b2632.wav",
      text: "It means check dream journal.",
    },
  },
  [normalizeText("It means check temperature.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_check_temperature_success_23147638.wav",
      text: "It means check temperature.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_check_temperature_success_23147638.wav",
      text: "It means check temperature.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_check_temperature_success_23147638.wav",
      text: "It means check temperature.",
    },
  },
  [normalizeText("It means chicken.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_chicken_success_eb5b4517.wav",
      text: "It means chicken.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_chicken_success_eb5b4517.wav",
      text: "It means chicken.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_chicken_success_eb5b4517.wav",
      text: "It means chicken.",
    },
  },
  [normalizeText("It means choose snack.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_choose_snack_success_6301c8bc.wav",
      text: "It means choose snack.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_choose_snack_success_6301c8bc.wav",
      text: "It means choose snack.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_choose_snack_success_6301c8bc.wav",
      text: "It means choose snack.",
    },
  },
  [normalizeText("It means choose story.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_choose_story_success_9782ffdd.wav",
      text: "It means choose story.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_choose_story_success_9782ffdd.wav",
      text: "It means choose story.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_choose_story_success_9782ffdd.wav",
      text: "It means choose story.",
    },
  },
  [normalizeText("It means choose toy.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/teach_choose_toy_success_3776a75b.wav",
      text: "It means choose toy.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/teach_choose_toy_success_3776a75b.wav",
      text: "It means choose toy.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/teach_choose_toy_success_3776a75b.wav",
      text: "It means choose toy.",
    },
  },
  [normalizeText("It means classroom.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_classroom_success_cab699d9.wav",
      text: "It means classroom.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_classroom_success_cab699d9.wav",
      text: "It means classroom.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_classroom_success_cab699d9.wav",
      text: "It means classroom.",
    },
  },
  [normalizeText("It means clean up toys.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/teach_clean_up_toys_success_866e1fe8.wav",
      text: "It means clean up toys.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/teach_clean_up_toys_success_866e1fe8.wav",
      text: "It means clean up toys.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/teach_clean_up_toys_success_866e1fe8.wav",
      text: "It means clean up toys.",
    },
  },
  [normalizeText("It means clean up.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/instructions_teach_clean_up_success_34a07d8e.wav",
      text: "It means clean up.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/instructions_teach_clean_up_success_34a07d8e.wav",
      text: "It means clean up.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/instructions_teach_clean_up_success_34a07d8e.wav",
      text: "It means clean up.",
    },
  },
  [normalizeText("It means cleaning brush.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_cleaning_brush_success_2ab94048.wav",
      text: "It means cleaning brush.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_cleaning_brush_success_2ab94048.wav",
      text: "It means cleaning brush.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_cleaning_brush_success_2ab94048.wav",
      text: "It means cleaning brush.",
    },
  },
  [normalizeText("It means clock.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_clock_success_0cd5062c.wav",
      text: "It means clock.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_clock_success_0cd5062c.wav",
      text: "It means clock.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_clock_success_0cd5062c.wav",
      text: "It means clock.",
    },
  },
  [normalizeText("It means close curtains.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_close_curtains_success_18ca4699.wav",
      text: "It means close curtains.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_close_curtains_success_18ca4699.wav",
      text: "It means close curtains.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_close_curtains_success_18ca4699.wav",
      text: "It means close curtains.",
    },
  },
  [normalizeText("It means cloth.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/teach_cloth_success_0e8590cb.wav",
      text: "It means cloth.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/teach_cloth_success_0e8590cb.wav",
      text: "It means cloth.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/teach_cloth_success_0e8590cb.wav",
      text: "It means cloth.",
    },
  },
  [normalizeText("It means coaster.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_coaster_success_8e7f03bf.wav",
      text: "It means coaster.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_coaster_success_8e7f03bf.wav",
      text: "It means coaster.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_coaster_success_8e7f03bf.wav",
      text: "It means coaster.",
    },
  },
  [normalizeText("It means comb hair.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_comb_hair_success_3d8984be.wav",
      text: "It means comb hair.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_comb_hair_success_3d8984be.wav",
      text: "It means comb hair.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_comb_hair_success_3d8984be.wav",
      text: "It means comb hair.",
    },
  },
  [normalizeText("It means comb.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_comb_success_de68e85f.wav",
      text: "It means comb.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_comb_success_de68e85f.wav",
      text: "It means comb.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_comb_success_de68e85f.wav",
      text: "It means comb.",
    },
  },
  [normalizeText("It means comfort plush.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_comfort_plush_success_4344fd95.wav",
      text: "It means comfort plush.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_comfort_plush_success_4344fd95.wav",
      text: "It means comfort plush.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_comfort_plush_success_4344fd95.wav",
      text: "It means comfort plush.",
    },
  },
  [normalizeText("It means compost bin.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_compost_bin_success_3f1db807.wav",
      text: "It means compost bin.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_compost_bin_success_3f1db807.wav",
      text: "It means compost bin.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_compost_bin_success_3f1db807.wav",
      text: "It means compost bin.",
    },
  },
  [normalizeText("It means cookie.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_cookie_success_6893bf21.wav",
      text: "It means cookie.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_cookie_success_6893bf21.wav",
      text: "It means cookie.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_cookie_success_6893bf21.wav",
      text: "It means cookie.",
    },
  },
  [normalizeText("It means cracker.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_cracker_success_e8c0e9cb.wav",
      text: "It means cracker.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_cracker_success_e8c0e9cb.wav",
      text: "It means cracker.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_cracker_success_e8c0e9cb.wav",
      text: "It means cracker.",
    },
  },
  [normalizeText("It means crayon.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_crayon_success_cc2d4349.wav",
      text: "It means crayon.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_crayon_success_cc2d4349.wav",
      text: "It means crayon.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_crayon_success_cc2d4349.wav",
      text: "It means crayon.",
    },
  },
  [normalizeText("It means crumbs.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/cleanup_teach_crumbs_success_fd6a487a.wav",
      text: "It means crumbs.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/cleanup_teach_crumbs_success_fd6a487a.wav",
      text: "It means crumbs.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/cleanup_teach_crumbs_success_fd6a487a.wav",
      text: "It means crumbs.",
    },
  },
  [normalizeText("It means cup.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_cup_success_f40f574d.wav",
      text: "It means cup.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_cup_success_f40f574d.wav",
      text: "It means cup.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_cup_success_f40f574d.wav",
      text: "It means cup.",
    },
  },
  [normalizeText("It means curtain.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_curtain_success_3db0cf6f.wav",
      text: "It means curtain.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_curtain_success_3db0cf6f.wav",
      text: "It means curtain.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_curtain_success_3db0cf6f.wav",
      text: "It means curtain.",
    },
  },
  [normalizeText("It means desk.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_desk_success_5ac167c2.wav",
      text: "It means desk.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_desk_success_5ac167c2.wav",
      text: "It means desk.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_desk_success_5ac167c2.wav",
      text: "It means desk.",
    },
  },
  [normalizeText("It means dessert.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_dessert_success_176ed822.wav",
      text: "It means dessert.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_dessert_success_176ed822.wav",
      text: "It means dessert.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_dessert_success_176ed822.wav",
      text: "It means dessert.",
    },
  },
  [normalizeText("It means dim lights.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_dim_lights_success_1eb28751.wav",
      text: "It means dim lights.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_dim_lights_success_1eb28751.wav",
      text: "It means dim lights.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_dim_lights_success_1eb28751.wav",
      text: "It means dim lights.",
    },
  },
  [normalizeText("It means dining light.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_dining_light_success_a95d8fdc.wav",
      text: "It means dining light.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_dining_light_success_a95d8fdc.wav",
      text: "It means dining light.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_dining_light_success_a95d8fdc.wav",
      text: "It means dining light.",
    },
  },
  [normalizeText("It means dinner bell.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_dinner_bell_success_5a0059d9.wav",
      text: "It means dinner bell.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_dinner_bell_success_5a0059d9.wav",
      text: "It means dinner bell.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_dinner_bell_success_5a0059d9.wav",
      text: "It means dinner bell.",
    },
  },
  [normalizeText("It means dinner.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_dinner_success_23d3da44.wav",
      text: "It means dinner.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_dinner_success_23d3da44.wav",
      text: "It means dinner.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_dinner_success_23d3da44.wav",
      text: "It means dinner.",
    },
  },
  [normalizeText("It means dish rack.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_dish_rack_success_995fef4f.wav",
      text: "It means dish rack.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_dish_rack_success_995fef4f.wav",
      text: "It means dish rack.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_dish_rack_success_995fef4f.wav",
      text: "It means dish rack.",
    },
  },
  [normalizeText("It means dishwasher.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_dishwasher_success_c5a454c9.wav",
      text: "It means dishwasher.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_dishwasher_success_c5a454c9.wav",
      text: "It means dishwasher.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_dishwasher_success_c5a454c9.wav",
      text: "It means dishwasher.",
    },
  },
  [normalizeText("It means doll.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_doll_success_8a387dc2.wav",
      text: "It means doll.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_doll_success_8a387dc2.wav",
      text: "It means doll.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_doll_success_8a387dc2.wav",
      text: "It means doll.",
    },
  },
  [normalizeText("It means door.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/teach_door_success_b49901b3.wav",
      text: "It means door.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/teach_door_success_b49901b3.wav",
      text: "It means door.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/teach_door_success_b49901b3.wav",
      text: "It means door.",
    },
  },
  [normalizeText("It means draw a circle.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_draw_circle_success_56d200bd.wav",
      text: "It means draw a circle.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_draw_circle_success_56d200bd.wav",
      text: "It means draw a circle.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_draw_circle_success_56d200bd.wav",
      text: "It means draw a circle.",
    },
  },
  [normalizeText("It means draw picture.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_draw_picture_success_214f0c67.wav",
      text: "It means draw picture.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_draw_picture_success_214f0c67.wav",
      text: "It means draw picture.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_draw_picture_success_214f0c67.wav",
      text: "It means draw picture.",
    },
  },
  [normalizeText("It means dream journal.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_dream_journal_success_33fcc2cb.wav",
      text: "It means dream journal.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_dream_journal_success_33fcc2cb.wav",
      text: "It means dream journal.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_dream_journal_success_33fcc2cb.wav",
      text: "It means dream journal.",
    },
  },
  [normalizeText("It means drink water.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_drink_water_success_fd9cfd65.wav",
      text: "It means drink water.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_drink_water_success_fd9cfd65.wav",
      text: "It means drink water.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_drink_water_success_fd9cfd65.wav",
      text: "It means drink water.",
    },
  },
  [normalizeText("It means drum.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_drum_success_84f01fdd.wav",
      text: "It means drum.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_drum_success_84f01fdd.wav",
      text: "It means drum.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_drum_success_84f01fdd.wav",
      text: "It means drum.",
    },
  },
  [normalizeText("It means dry face.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_dry_face_success_47dcf6c8.wav",
      text: "It means dry face.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_dry_face_success_47dcf6c8.wav",
      text: "It means dry face.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_dry_face_success_47dcf6c8.wav",
      text: "It means dry face.",
    },
  },
  [normalizeText("It means dry surface.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_dry_surface_success_b0d022d4.wav",
      text: "It means dry surface.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_dry_surface_success_b0d022d4.wav",
      text: "It means dry surface.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_dry_surface_success_b0d022d4.wav",
      text: "It means dry surface.",
    },
  },
  [normalizeText("It means drying mat.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_drying_mat_success_23a48f2e.wav",
      text: "It means drying mat.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_drying_mat_success_23a48f2e.wav",
      text: "It means drying mat.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_drying_mat_success_23a48f2e.wav",
      text: "It means drying mat.",
    },
  },
  [normalizeText("It means eat breakfast.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_eat_breakfast_success_fcec3690.wav",
      text: "It means eat breakfast.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_eat_breakfast_success_fcec3690.wav",
      text: "It means eat breakfast.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_eat_breakfast_success_fcec3690.wav",
      text: "It means eat breakfast.",
    },
  },
  [normalizeText("It means eat lunch.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_eat_lunch_success_460f4406.wav",
      text: "It means eat lunch.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_eat_lunch_success_460f4406.wav",
      text: "It means eat lunch.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_eat_lunch_success_460f4406.wav",
      text: "It means eat lunch.",
    },
  },
  [normalizeText("It means eat snack.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_eat_snack_success_27a264b7.wav",
      text: "It means eat snack.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_eat_snack_success_27a264b7.wav",
      text: "It means eat snack.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_eat_snack_success_27a264b7.wav",
      text: "It means eat snack.",
    },
  },
  [normalizeText("It means egg.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_egg_success_82e1104c.wav",
      text: "It means egg.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_egg_success_82e1104c.wav",
      text: "It means egg.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_egg_success_82e1104c.wav",
      text: "It means egg.",
    },
  },
  [normalizeText("It means elbow.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_elbow_success_a268ac3b.wav",
      text: "It means elbow.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_elbow_success_a268ac3b.wav",
      text: "It means elbow.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_elbow_success_a268ac3b.wav",
      text: "It means elbow.",
    },
  },
  [normalizeText("It means eraser.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_eraser_success_671475ca.wav",
      text: "It means eraser.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_eraser_success_671475ca.wav",
      text: "It means eraser.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_eraser_success_671475ca.wav",
      text: "It means eraser.",
    },
  },
  [normalizeText("It means family.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/teach_family_success_63960db4.wav",
      text: "It means family.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/teach_family_success_63960db4.wav",
      text: "It means family.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/teach_family_success_63960db4.wav",
      text: "It means family.",
    },
  },
  [normalizeText("It means fish.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_fish_success_03180e6d.wav",
      text: "It means fish.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_fish_success_03180e6d.wav",
      text: "It means fish.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_fish_success_03180e6d.wav",
      text: "It means fish.",
    },
  },
  [normalizeText("It means floor.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/teach_floor_success_1900806f.wav",
      text: "It means floor.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/teach_floor_success_1900806f.wav",
      text: "It means floor.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/teach_floor_success_1900806f.wav",
      text: "It means floor.",
    },
  },
  [normalizeText("It means foam.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_foam_success_28c79bd6.wav",
      text: "It means foam.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_foam_success_28c79bd6.wav",
      text: "It means foam.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_foam_success_28c79bd6.wav",
      text: "It means foam.",
    },
  },
  [normalizeText("It means folder.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/teach_folder_success_d12bbd63.wav",
      text: "It means folder.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/teach_folder_success_d12bbd63.wav",
      text: "It means folder.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/teach_folder_success_d12bbd63.wav",
      text: "It means folder.",
    },
  },
  [normalizeText("It means food cover.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_food_cover_success_64cdaf5b.wav",
      text: "It means food cover.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_food_cover_success_64cdaf5b.wav",
      text: "It means food cover.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_food_cover_success_64cdaf5b.wav",
      text: "It means food cover.",
    },
  },
  [normalizeText("It means fork.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_fork_success_c3e2b71d.wav",
      text: "It means fork.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_fork_success_c3e2b71d.wav",
      text: "It means fork.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_fork_success_c3e2b71d.wav",
      text: "It means fork.",
    },
  },
  [normalizeText("It means friend.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_friend_success_d87e6038.wav",
      text: "It means friend.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_friend_success_d87e6038.wav",
      text: "It means friend.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_friend_success_d87e6038.wav",
      text: "It means friend.",
    },
  },
  [normalizeText("It means fruit.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/lunchtable_teach_fruit_success_3373ab8a.wav",
      text: "It means fruit.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/lunchtable_teach_fruit_success_3373ab8a.wav",
      text: "It means fruit.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/lunchtable_teach_fruit_success_3373ab8a.wav",
      text: "It means fruit.",
    },
  },
  [normalizeText("It means get on bus.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_get_on_bus_success_729c74c4.wav",
      text: "It means get on bus.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_get_on_bus_success_729c74c4.wav",
      text: "It means get on bus.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_get_on_bus_success_729c74c4.wav",
      text: "It means get on bus.",
    },
  },
  [normalizeText("It means glow sticker.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_glow_sticker_success_aec480af.wav",
      text: "It means glow sticker.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_glow_sticker_success_aec480af.wav",
      text: "It means glow sticker.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_glow_sticker_success_aec480af.wav",
      text: "It means glow sticker.",
    },
  },
  [normalizeText("It means go to school.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_go_to_school_success_e5b37713.wav",
      text: "It means go to school.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_go_to_school_success_e5b37713.wav",
      text: "It means go to school.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_go_to_school_success_e5b37713.wav",
      text: "It means go to school.",
    },
  },
  [normalizeText("It means good morning.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_good_morning_success_88d7f0a0.wav",
      text: "It means good morning.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_good_morning_success_88d7f0a0.wav",
      text: "It means good morning.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_good_morning_success_88d7f0a0.wav",
      text: "It means good morning.",
    },
  },
  [normalizeText("It means hang robe.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_hang_robe_success_2eabd4c9.wav",
      text: "It means hang robe.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_hang_robe_success_2eabd4c9.wav",
      text: "It means hang robe.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_hang_robe_success_2eabd4c9.wav",
      text: "It means hang robe.",
    },
  },
  [normalizeText("It means home.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_home_success_54813c85.wav",
      text: "It means home.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_home_success_54813c85.wav",
      text: "It means home.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_home_success_54813c85.wav",
      text: "It means home.",
    },
  },
  [normalizeText("It means hook.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_hook_success_6267c744.wav",
      text: "It means hook.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_hook_success_6267c744.wav",
      text: "It means hook.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_hook_success_6267c744.wav",
      text: "It means hook.",
    },
  },
  [normalizeText("It means hug comfort plush.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_hug_comfort_plush_success_c55f65c8.wav",
      text: "It means hug comfort plush.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_hug_comfort_plush_success_c55f65c8.wav",
      text: "It means hug comfort plush.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_hug_comfort_plush_success_c55f65c8.wav",
      text: "It means hug comfort plush.",
    },
  },
  [normalizeText("It means hug family.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/teach_hug_family_success_2861c74f.wav",
      text: "It means hug family.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/teach_hug_family_success_2861c74f.wav",
      text: "It means hug family.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/teach_hug_family_success_2861c74f.wav",
      text: "It means hug family.",
    },
  },
  [normalizeText("It means humidifier.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_humidifier_success_0d7b217a.wav",
      text: "It means humidifier.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_humidifier_success_0d7b217a.wav",
      text: "It means humidifier.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_humidifier_success_0d7b217a.wav",
      text: "It means humidifier.",
    },
  },
  [normalizeText("It means jacket.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/teach_jacket_success_477305e1.wav",
      text: "It means jacket.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/teach_jacket_success_477305e1.wav",
      text: "It means jacket.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/teach_jacket_success_477305e1.wav",
      text: "It means jacket.",
    },
  },
  [normalizeText("It means juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_juice_success_f406fb01.wav",
      text: "It means juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_juice_success_f406fb01.wav",
      text: "It means juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_juice_success_f406fb01.wav",
      text: "It means juice.",
    },
  },
  [normalizeText("It means jump.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_jump_success_8143110d.wav",
      text: "It means jump.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_jump_success_8143110d.wav",
      text: "It means jump.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_jump_success_8143110d.wav",
      text: "It means jump.",
    },
  },
  [normalizeText("It means kitchen counter.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_kitchen_counter_success_f9113107.wav",
      text: "It means kitchen counter.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_kitchen_counter_success_f9113107.wav",
      text: "It means kitchen counter.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_kitchen_counter_success_f9113107.wav",
      text: "It means kitchen counter.",
    },
  },
  [normalizeText("It means kite.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_kite_success_b242cad8.wav",
      text: "It means kite.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_kite_success_b242cad8.wav",
      text: "It means kite.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_kite_success_b242cad8.wav",
      text: "It means kite.",
    },
  },
  [normalizeText("It means knee.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_knee_success_d57ac567.wav",
      text: "It means knee.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_knee_success_d57ac567.wav",
      text: "It means knee.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_knee_success_d57ac567.wav",
      text: "It means knee.",
    },
  },
  [normalizeText("It means label container.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_label_container_success_b66e7da8.wav",
      text: "It means label container.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_label_container_success_b66e7da8.wav",
      text: "It means label container.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_label_container_success_b66e7da8.wav",
      text: "It means label container.",
    },
  },
  [normalizeText("It means label.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_label_success_030ea0d3.wav",
      text: "It means label.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_label_success_030ea0d3.wav",
      text: "It means label.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_label_success_030ea0d3.wav",
      text: "It means label.",
    },
  },
  [normalizeText("It means ladle.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_ladle_success_f118a16d.wav",
      text: "It means ladle.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_ladle_success_f118a16d.wav",
      text: "It means ladle.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_ladle_success_f118a16d.wav",
      text: "It means ladle.",
    },
  },
  [normalizeText("It means lamp.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_lamp_success_16fcca94.wav",
      text: "It means lamp.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_lamp_success_16fcca94.wav",
      text: "It means lamp.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_lamp_success_16fcca94.wav",
      text: "It means lamp.",
    },
  },
  [normalizeText("It means laundry basket.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_laundry_basket_success_c1a8c1ab.wav",
      text: "It means laundry basket.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_laundry_basket_success_c1a8c1ab.wav",
      text: "It means laundry basket.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_laundry_basket_success_c1a8c1ab.wav",
      text: "It means laundry basket.",
    },
  },
  [normalizeText("It means leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_leftovers_success_0050bbb7.wav",
      text: "It means leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_leftovers_success_0050bbb7.wav",
      text: "It means leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_leftovers_success_0050bbb7.wav",
      text: "It means leftovers.",
    },
  },
  [normalizeText("It means line up.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/teach_line_up_success_e5728141.wav",
      text: "It means line up.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/teach_line_up_success_e5728141.wav",
      text: "It means line up.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/teach_line_up_success_e5728141.wav",
      text: "It means line up.",
    },
  },
  [normalizeText("It means listen.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/instructions_teach_listen_success_6b7b835a.wav",
      text: "It means listen.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/instructions_teach_listen_success_6b7b835a.wav",
      text: "It means listen.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/instructions_teach_listen_success_6b7b835a.wav",
      text: "It means listen.",
    },
  },
  [normalizeText("It means load dishwasher.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_load_dishwasher_success_ce2a81ec.wav",
      text: "It means load dishwasher.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_load_dishwasher_success_ce2a81ec.wav",
      text: "It means load dishwasher.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_load_dishwasher_success_ce2a81ec.wav",
      text: "It means load dishwasher.",
    },
  },
  [normalizeText("It means lullaby.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_lullaby_success_5e03af6d.wav",
      text: "It means lullaby.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_lullaby_success_5e03af6d.wav",
      text: "It means lullaby.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_lullaby_success_5e03af6d.wav",
      text: "It means lullaby.",
    },
  },
  [normalizeText("It means lunchbox.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_lunchbox_success_2eec4614.wav",
      text: "It means lunchbox.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_lunchbox_success_2eec4614.wav",
      text: "It means lunchbox.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_lunchbox_success_2eec4614.wav",
      text: "It means lunchbox.",
    },
  },
  [normalizeText("It means make bubbles.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_make_bubbles_success_55d98d99.wav",
      text: "It means make bubbles.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_make_bubbles_success_55d98d99.wav",
      text: "It means make bubbles.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_make_bubbles_success_55d98d99.wav",
      text: "It means make bubbles.",
    },
  },
  [normalizeText("It means make the bed.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_make_the_bed_success_efab6181.wav",
      text: "It means make the bed.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_make_the_bed_success_efab6181.wav",
      text: "It means make the bed.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_make_the_bed_success_efab6181.wav",
      text: "It means make the bed.",
    },
  },
  [normalizeText("It means milk.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_milk_success_5d26d122.wav",
      text: "It means milk.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_milk_success_5d26d122.wav",
      text: "It means milk.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_milk_success_5d26d122.wav",
      text: "It means milk.",
    },
  },
  [normalizeText("It means mirror.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_mirror_success_6e8a0a49.wav",
      text: "It means mirror.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_mirror_success_6e8a0a49.wav",
      text: "It means mirror.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_mirror_success_6e8a0a49.wav",
      text: "It means mirror.",
    },
  },
  [normalizeText("It means moon mobile.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_moon_mobile_success_5444dca7.wav",
      text: "It means moon mobile.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_moon_mobile_success_5444dca7.wav",
      text: "It means moon mobile.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_moon_mobile_success_5444dca7.wav",
      text: "It means moon mobile.",
    },
  },
  [normalizeText("It means move cart.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_move_cart_success_983367d2.wav",
      text: "It means move cart.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_move_cart_success_983367d2.wav",
      text: "It means move cart.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_move_cart_success_983367d2.wav",
      text: "It means move cart.",
    },
  },
  [normalizeText("It means music.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_music_success_f47d2139.wav",
      text: "It means music.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_music_success_f47d2139.wav",
      text: "It means music.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_music_success_f47d2139.wav",
      text: "It means music.",
    },
  },
  [normalizeText("It means napkin.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/lunchtable_teach_napkin_success_9868c463.wav",
      text: "It means napkin.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/lunchtable_teach_napkin_success_9868c463.wav",
      text: "It means napkin.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/lunchtable_teach_napkin_success_9868c463.wav",
      text: "It means napkin.",
    },
  },
  [normalizeText("It means night light.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_night_light_success_bba6b687.wav",
      text: "It means night light.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_night_light_success_bba6b687.wav",
      text: "It means night light.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_night_light_success_bba6b687.wav",
      text: "It means night light.",
    },
  },
  [normalizeText("It means nightstand.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_nightstand_success_24ffb0ef.wav",
      text: "It means nightstand.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_nightstand_success_24ffb0ef.wav",
      text: "It means nightstand.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_nightstand_success_24ffb0ef.wav",
      text: "It means nightstand.",
    },
  },
  [normalizeText("It means noodles.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_noodles_success_c2acd876.wav",
      text: "It means noodles.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_noodles_success_c2acd876.wav",
      text: "It means noodles.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_noodles_success_c2acd876.wav",
      text: "It means noodles.",
    },
  },
  [normalizeText("It means notebook.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_notebook_success_d6dc7fd7.wav",
      text: "It means notebook.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_notebook_success_d6dc7fd7.wav",
      text: "It means notebook.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_notebook_success_d6dc7fd7.wav",
      text: "It means notebook.",
    },
  },
  [normalizeText("It means open book.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_open_book_success_a75c6b30.wav",
      text: "It means open book.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_open_book_success_a75c6b30.wav",
      text: "It means open book.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_open_book_success_a75c6b30.wav",
      text: "It means open book.",
    },
  },
  [normalizeText("It means open lunchbox.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_open_lunchbox_success_f6d41c10.wav",
      text: "It means open lunchbox.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_open_lunchbox_success_f6d41c10.wav",
      text: "It means open lunchbox.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_open_lunchbox_success_f6d41c10.wav",
      text: "It means open lunchbox.",
    },
  },
  [normalizeText("It means open snack box.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_open_snack_box_success_5bb0d9a9.wav",
      text: "It means open snack box.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_open_snack_box_success_5bb0d9a9.wav",
      text: "It means open snack box.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_open_snack_box_success_5bb0d9a9.wav",
      text: "It means open snack box.",
    },
  },
  [normalizeText("It means pack bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_pack_bag_success_e07fdd48.wav",
      text: "It means pack bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_pack_bag_success_e07fdd48.wav",
      text: "It means pack bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_pack_bag_success_e07fdd48.wav",
      text: "It means pack bag.",
    },
  },
  [normalizeText("It means page tab.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_page_tab_success_1af41fda.wav",
      text: "It means page tab.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_page_tab_success_1af41fda.wav",
      text: "It means page tab.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_page_tab_success_1af41fda.wav",
      text: "It means page tab.",
    },
  },
  [normalizeText("It means pajamas.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_pajamas_success_438bf42b.wav",
      text: "It means pajamas.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_pajamas_success_438bf42b.wav",
      text: "It means pajamas.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_pajamas_success_438bf42b.wav",
      text: "It means pajamas.",
    },
  },
  [normalizeText("It means paper.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_paper_success_ddecdf76.wav",
      text: "It means paper.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_paper_success_ddecdf76.wav",
      text: "It means paper.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_paper_success_ddecdf76.wav",
      text: "It means paper.",
    },
  },
  [normalizeText("It means pass dish.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_pass_dish_success_c772f2f8.wav",
      text: "It means pass dish.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_pass_dish_success_c772f2f8.wav",
      text: "It means pass dish.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_pass_dish_success_c772f2f8.wav",
      text: "It means pass dish.",
    },
  },
  [normalizeText("It means pencil.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_pencil_success_b927694c.wav",
      text: "It means pencil.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_pencil_success_b927694c.wav",
      text: "It means pencil.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_pencil_success_b927694c.wav",
      text: "It means pencil.",
    },
  },
  [normalizeText("It means pillow.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_pillow_success_461d47a2.wav",
      text: "It means pillow.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_pillow_success_461d47a2.wav",
      text: "It means pillow.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_pillow_success_461d47a2.wav",
      text: "It means pillow.",
    },
  },
  [normalizeText("It means place bookmark.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_place_bookmark_success_2e0bcd89.wav",
      text: "It means place bookmark.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_place_bookmark_success_2e0bcd89.wav",
      text: "It means place bookmark.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_place_bookmark_success_2e0bcd89.wav",
      text: "It means place bookmark.",
    },
  },
  [normalizeText("It means placemat.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_placemat_success_b0a02a76.wav",
      text: "It means placemat.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_placemat_success_b0a02a76.wav",
      text: "It means placemat.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_placemat_success_b0a02a76.wav",
      text: "It means placemat.",
    },
  },
  [normalizeText("It means plate.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_plate_success_f4d393c6.wav",
      text: "It means plate.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_plate_success_f4d393c6.wav",
      text: "It means plate.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_plate_success_f4d393c6.wav",
      text: "It means plate.",
    },
  },
  [normalizeText("It means play gently.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/teach_play_gently_success_453b4197.wav",
      text: "It means play gently.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/teach_play_gently_success_453b4197.wav",
      text: "It means play gently.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/teach_play_gently_success_453b4197.wav",
      text: "It means play gently.",
    },
  },
  [normalizeText("It means play lullaby.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_play_lullaby_success_bb84923c.wav",
      text: "It means play lullaby.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_play_lullaby_success_bb84923c.wav",
      text: "It means play lullaby.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_play_lullaby_success_bb84923c.wav",
      text: "It means play lullaby.",
    },
  },
  [normalizeText("It means play together.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_play_together_success_329e801f.wav",
      text: "It means play together.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_play_together_success_329e801f.wav",
      text: "It means play together.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_play_together_success_329e801f.wav",
      text: "It means play together.",
    },
  },
  [normalizeText("It means playground.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_playground_success_81a141dc.wav",
      text: "It means playground.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_playground_success_81a141dc.wav",
      text: "It means playground.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_playground_success_81a141dc.wav",
      text: "It means playground.",
    },
  },
  [normalizeText("It means pot holder.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_pot_holder_success_33d257b0.wav",
      text: "It means pot holder.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_pot_holder_success_33d257b0.wav",
      text: "It means pot holder.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_pot_holder_success_33d257b0.wav",
      text: "It means pot holder.",
    },
  },
  [normalizeText("It means pour juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_pour_juice_success_922560c4.wav",
      text: "It means pour juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_pour_juice_success_922560c4.wav",
      text: "It means pour juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_pour_juice_success_922560c4.wav",
      text: "It means pour juice.",
    },
  },
  [normalizeText("It means pour milk.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/teach_pour_milk_success_4623b5e3.wav",
      text: "It means pour milk.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/teach_pour_milk_success_4623b5e3.wav",
      text: "It means pour milk.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/teach_pour_milk_success_4623b5e3.wav",
      text: "It means pour milk.",
    },
  },
  [normalizeText("It means put away book.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/teach_put_away_book_success_a5261684.wav",
      text: "It means put away book.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/teach_put_away_book_success_a5261684.wav",
      text: "It means put away book.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/teach_put_away_book_success_a5261684.wav",
      text: "It means put away book.",
    },
  },
  [normalizeText("It means put away tray.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/teach_put_away_tray_success_69cb1c31.wav",
      text: "It means put away tray.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/teach_put_away_tray_success_69cb1c31.wav",
      text: "It means put away tray.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/teach_put_away_tray_success_69cb1c31.wav",
      text: "It means put away tray.",
    },
  },
  [normalizeText("It means put on pajamas.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_put_on_pajamas_success_a65d803b.wav",
      text: "It means put on pajamas.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_put_on_pajamas_success_a65d803b.wav",
      text: "It means put on pajamas.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_put_on_pajamas_success_a65d803b.wav",
      text: "It means put on pajamas.",
    },
  },
  [normalizeText("It means put on shoes.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_put_on_shoes_success_4d5c9596.wav",
      text: "It means put on shoes.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_put_on_shoes_success_4d5c9596.wav",
      text: "It means put on shoes.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_put_on_shoes_success_4d5c9596.wav",
      text: "It means put on shoes.",
    },
  },
  [normalizeText("It means puzzle.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_puzzle_success_e031c29a.wav",
      text: "It means puzzle.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_puzzle_success_e031c29a.wav",
      text: "It means puzzle.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_puzzle_success_e031c29a.wav",
      text: "It means puzzle.",
    },
  },
  [normalizeText("It means raise hand.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_raise_hand_success_96f2426a.wav",
      text: "It means raise hand.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_raise_hand_success_96f2426a.wav",
      text: "It means raise hand.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_raise_hand_success_96f2426a.wav",
      text: "It means raise hand.",
    },
  },
  [normalizeText("It means raisins.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_raisins_success_b7341eda.wav",
      text: "It means raisins.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_raisins_success_b7341eda.wav",
      text: "It means raisins.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_raisins_success_b7341eda.wav",
      text: "It means raisins.",
    },
  },
  [normalizeText("It means read book.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_read_book_success_fe456c28.wav",
      text: "It means read book.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_read_book_success_fe456c28.wav",
      text: "It means read book.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_read_book_success_fe456c28.wav",
      text: "It means read book.",
    },
  },
  [normalizeText("It means read softly.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_read_softly_success_d7e69377.wav",
      text: "It means read softly.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_read_softly_success_d7e69377.wav",
      text: "It means read softly.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_read_softly_success_d7e69377.wav",
      text: "It means read softly.",
    },
  },
  [normalizeText("It means reading nook.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_reading_nook_success_ab97c133.wav",
      text: "It means reading nook.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_reading_nook_success_ab97c133.wav",
      text: "It means reading nook.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_reading_nook_success_ab97c133.wav",
      text: "It means reading nook.",
    },
  },
  [normalizeText("It means recycling bin.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_recycling_bin_success_475d799c.wav",
      text: "It means recycling bin.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_recycling_bin_success_475d799c.wav",
      text: "It means recycling bin.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_recycling_bin_success_475d799c.wav",
      text: "It means recycling bin.",
    },
  },
  [normalizeText("It means rest.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_rest_success_5ffa4725.wav",
      text: "It means rest.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_rest_success_5ffa4725.wav",
      text: "It means rest.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_rest_success_5ffa4725.wav",
      text: "It means rest.",
    },
  },
  [normalizeText("It means rice.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_rice_success_bb31ca8f.wav",
      text: "It means rice.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_rice_success_bb31ca8f.wav",
      text: "It means rice.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_rice_success_bb31ca8f.wav",
      text: "It means rice.",
    },
  },
  [normalizeText("It means rinse hair.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_rinse_hair_success_bc323072.wav",
      text: "It means rinse hair.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_rinse_hair_success_bc323072.wav",
      text: "It means rinse hair.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_rinse_hair_success_bc323072.wav",
      text: "It means rinse hair.",
    },
  },
  [normalizeText("It means road.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_road_success_1b6e46c2.wav",
      text: "It means road.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_road_success_1b6e46c2.wav",
      text: "It means road.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_road_success_1b6e46c2.wav",
      text: "It means road.",
    },
  },
  [normalizeText("It means robe.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_robe_success_12606833.wav",
      text: "It means robe.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_robe_success_12606833.wav",
      text: "It means robe.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_robe_success_12606833.wav",
      text: "It means robe.",
    },
  },
  [normalizeText("It means rope.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_rope_success_91d94cee.wav",
      text: "It means rope.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_rope_success_91d94cee.wav",
      text: "It means rope.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_rope_success_91d94cee.wav",
      text: "It means rope.",
    },
  },
  [normalizeText("It means rubber gloves.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_rubber_gloves_success_b24f61ac.wav",
      text: "It means rubber gloves.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_rubber_gloves_success_b24f61ac.wav",
      text: "It means rubber gloves.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_rubber_gloves_success_b24f61ac.wav",
      text: "It means rubber gloves.",
    },
  },
  [normalizeText("It means ruler.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_ruler_success_56726a58.wav",
      text: "It means ruler.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_ruler_success_56726a58.wav",
      text: "It means ruler.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_ruler_success_56726a58.wav",
      text: "It means ruler.",
    },
  },
  [normalizeText("It means run.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_run_success_ab27beb1.wav",
      text: "It means run.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_run_success_ab27beb1.wav",
      text: "It means run.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_run_success_ab27beb1.wav",
      text: "It means run.",
    },
  },
  [normalizeText("It means salad.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_salad_success_6e147594.wav",
      text: "It means salad.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_salad_success_6e147594.wav",
      text: "It means salad.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_salad_success_6e147594.wav",
      text: "It means salad.",
    },
  },
  [normalizeText("It means sandbox.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_sandbox_success_50f512a2.wav",
      text: "It means sandbox.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_sandbox_success_50f512a2.wav",
      text: "It means sandbox.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_sandbox_success_50f512a2.wav",
      text: "It means sandbox.",
    },
  },
  [normalizeText("It means sauce.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_sauce_success_9872d2fe.wav",
      text: "It means sauce.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_sauce_success_9872d2fe.wav",
      text: "It means sauce.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_sauce_success_9872d2fe.wav",
      text: "It means sauce.",
    },
  },
  [normalizeText("It means save leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_save_leftovers_success_fbba1cbc.wav",
      text: "It means save leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_save_leftovers_success_fbba1cbc.wav",
      text: "It means save leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_save_leftovers_success_fbba1cbc.wav",
      text: "It means save leftovers.",
    },
  },
  [normalizeText("It means say good night.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/teach_say_good_night_success_f234ac48.wav",
      text: "It means say good night.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/teach_say_good_night_success_f234ac48.wav",
      text: "It means say good night.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/teach_say_good_night_success_f234ac48.wav",
      text: "It means say good night.",
    },
  },
  [normalizeText("It means say goodbye.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/teach_say_goodbye_success_3f4eea5d.wav",
      text: "It means say goodbye.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/teach_say_goodbye_success_3f4eea5d.wav",
      text: "It means say goodbye.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/teach_say_goodbye_success_3f4eea5d.wav",
      text: "It means say goodbye.",
    },
  },
  [normalizeText("It means say thank you.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/lunchtable_teach_say_thank_you_success_81716523.wav",
      text: "It means say thank you.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/lunchtable_teach_say_thank_you_success_81716523.wav",
      text: "It means say thank you.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/lunchtable_teach_say_thank_you_success_81716523.wav",
      text: "It means say thank you.",
    },
  },
  [normalizeText("It means scraper.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_scraper_success_76f1f5f7.wav",
      text: "It means scraper.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_scraper_success_76f1f5f7.wav",
      text: "It means scraper.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_scraper_success_76f1f5f7.wav",
      text: "It means scraper.",
    },
  },
  [normalizeText("It means scrub knees.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_scrub_knees_success_3ea2ebe5.wav",
      text: "It means scrub knees.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_scrub_knees_success_3ea2ebe5.wav",
      text: "It means scrub knees.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_scrub_knees_success_3ea2ebe5.wav",
      text: "It means scrub knees.",
    },
  },
  [normalizeText("It means scrub spot.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_scrub_spot_success_a6106c25.wav",
      text: "It means scrub spot.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_scrub_spot_success_a6106c25.wav",
      text: "It means scrub spot.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_scrub_spot_success_a6106c25.wav",
      text: "It means scrub spot.",
    },
  },
  [normalizeText("It means seat belt.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_seat_belt_success_9397f10b.wav",
      text: "It means seat belt.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_seat_belt_success_9397f10b.wav",
      text: "It means seat belt.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_seat_belt_success_9397f10b.wav",
      text: "It means seat belt.",
    },
  },
  [normalizeText("It means seesaw.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_seesaw_success_578ea0ea.wav",
      text: "It means seesaw.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_seesaw_success_578ea0ea.wav",
      text: "It means seesaw.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_seesaw_success_578ea0ea.wav",
      text: "It means seesaw.",
    },
  },
  [normalizeText("It means serve noodles.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_serve_noodles_success_610d37e7.wav",
      text: "It means serve noodles.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_serve_noodles_success_610d37e7.wav",
      text: "It means serve noodles.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_serve_noodles_success_610d37e7.wav",
      text: "It means serve noodles.",
    },
  },
  [normalizeText("It means serving cart.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_serving_cart_success_7afbabb7.wav",
      text: "It means serving cart.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_serving_cart_success_7afbabb7.wav",
      text: "It means serving cart.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_serving_cart_success_7afbabb7.wav",
      text: "It means serving cart.",
    },
  },
  [normalizeText("It means serving tray.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_serving_tray_success_0ecebc73.wav",
      text: "It means serving tray.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_serving_tray_success_0ecebc73.wav",
      text: "It means serving tray.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_serving_tray_success_0ecebc73.wav",
      text: "It means serving tray.",
    },
  },
  [normalizeText("It means set placemat.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/teach_set_placemat_success_6525e0d9.wav",
      text: "It means set placemat.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/teach_set_placemat_success_6525e0d9.wav",
      text: "It means set placemat.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/teach_set_placemat_success_6525e0d9.wav",
      text: "It means set placemat.",
    },
  },
  [normalizeText("It means shade.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_shade_success_059709b9.wav",
      text: "It means shade.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_shade_success_059709b9.wav",
      text: "It means shade.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_shade_success_059709b9.wav",
      text: "It means shade.",
    },
  },
  [normalizeText("It means shampoo.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_shampoo_success_e2ab0500.wav",
      text: "It means shampoo.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_shampoo_success_e2ab0500.wav",
      text: "It means shampoo.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_shampoo_success_e2ab0500.wav",
      text: "It means shampoo.",
    },
  },
  [normalizeText("It means share food.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/lunchtable_teach_share_food_success_3b546457.wav",
      text: "It means share food.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/lunchtable_teach_share_food_success_3b546457.wav",
      text: "It means share food.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/lunchtable_teach_share_food_success_3b546457.wav",
      text: "It means share food.",
    },
  },
  [normalizeText("It means share toys.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_share_toys_success_3d2cfa1f.wav",
      text: "It means share toys.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_share_toys_success_3d2cfa1f.wav",
      text: "It means share toys.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_share_toys_success_3d2cfa1f.wav",
      text: "It means share toys.",
    },
  },
  [normalizeText("It means shelf.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/teach_shelf_success_3da78004.wav",
      text: "It means shelf.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/teach_shelf_success_3da78004.wav",
      text: "It means shelf.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/teach_shelf_success_3da78004.wav",
      text: "It means shelf.",
    },
  },
  [normalizeText("It means shoes.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_shoes_success_b5994227.wav",
      text: "It means shoes.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_shoes_success_b5994227.wav",
      text: "It means shoes.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_shoes_success_b5994227.wav",
      text: "It means shoes.",
    },
  },
  [normalizeText("It means shoulder.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_shoulder_success_67c13a8c.wav",
      text: "It means shoulder.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_shoulder_success_67c13a8c.wav",
      text: "It means shoulder.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_shoulder_success_67c13a8c.wav",
      text: "It means shoulder.",
    },
  },
  [normalizeText("It means shower head.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/teach_shower_head_success_b4883eab.wav",
      text: "It means shower head.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/teach_shower_head_success_b4883eab.wav",
      text: "It means shower head.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/teach_shower_head_success_b4883eab.wav",
      text: "It means shower head.",
    },
  },
  [normalizeText("It means shower.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_shower_success_e7e42145.wav",
      text: "It means shower.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_shower_success_e7e42145.wav",
      text: "It means shower.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_shower_success_e7e42145.wav",
      text: "It means shower.",
    },
  },
  [normalizeText("It means sink.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_sink_success_750b8b0b.wav",
      text: "It means sink.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_sink_success_750b8b0b.wav",
      text: "It means sink.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_sink_success_750b8b0b.wav",
      text: "It means sink.",
    },
  },
  [normalizeText("It means sip juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_sip_juice_success_7d004b21.wav",
      text: "It means sip juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_sip_juice_success_7d004b21.wav",
      text: "It means sip juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_sip_juice_success_7d004b21.wav",
      text: "It means sip juice.",
    },
  },
  [normalizeText("It means sip.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_sip_success_27bfd353.wav",
      text: "It means sip.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_sip_success_27bfd353.wav",
      text: "It means sip.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_sip_success_27bfd353.wav",
      text: "It means sip.",
    },
  },
  [normalizeText("It means sit at table.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/lunchtable_teach_sit_at_table_success_d47a9dc0.wav",
      text: "It means sit at table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/lunchtable_teach_sit_at_table_success_d47a9dc0.wav",
      text: "It means sit at table.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/lunchtable_teach_sit_at_table_success_d47a9dc0.wav",
      text: "It means sit at table.",
    },
  },
  [normalizeText("It means sit down.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_sit_down_success_4b8371ad.wav",
      text: "It means sit down.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_sit_down_success_4b8371ad.wav",
      text: "It means sit down.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_sit_down_success_4b8371ad.wav",
      text: "It means sit down.",
    },
  },
  [normalizeText("It means sleep mask.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_sleep_mask_success_35e1ff3a.wav",
      text: "It means sleep mask.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_sleep_mask_success_35e1ff3a.wav",
      text: "It means sleep mask.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_sleep_mask_success_35e1ff3a.wav",
      text: "It means sleep mask.",
    },
  },
  [normalizeText("It means slide.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_slide_success_173cbbb7.wav",
      text: "It means slide.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_slide_success_173cbbb7.wav",
      text: "It means slide.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_slide_success_173cbbb7.wav",
      text: "It means slide.",
    },
  },
  [normalizeText("It means slippers.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/teach_slippers_success_61310ca0.wav",
      text: "It means slippers.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/teach_slippers_success_61310ca0.wav",
      text: "It means slippers.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/teach_slippers_success_61310ca0.wav",
      text: "It means slippers.",
    },
  },
  [normalizeText("It means small table.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_small_table_success_e704bd0b.wav",
      text: "It means small table.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_small_table_success_e704bd0b.wav",
      text: "It means small table.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_small_table_success_e704bd0b.wav",
      text: "It means small table.",
    },
  },
  [normalizeText("It means snack box.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_snack_box_success_e76e6058.wav",
      text: "It means snack box.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_snack_box_success_e76e6058.wav",
      text: "It means snack box.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_snack_box_success_e76e6058.wav",
      text: "It means snack box.",
    },
  },
  [normalizeText("It means snack.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest_teach_snack_success_d71ab77b.wav",
      text: "It means snack.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest_teach_snack_success_d71ab77b.wav",
      text: "It means snack.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest_teach_snack_success_d71ab77b.wav",
      text: "It means snack.",
    },
  },
  [normalizeText("It means soap.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_soap_success_fd4d1b74.wav",
      text: "It means soap.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_soap_success_fd4d1b74.wav",
      text: "It means soap.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_soap_success_fd4d1b74.wav",
      text: "It means soap.",
    },
  },
  [normalizeText("It means socks.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_socks_success_b638f515.wav",
      text: "It means socks.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_socks_success_b638f515.wav",
      text: "It means socks.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_socks_success_b638f515.wav",
      text: "It means socks.",
    },
  },
  [normalizeText("It means soft voice.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_soft_voice_success_af0ef58c.wav",
      text: "It means soft voice.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_soft_voice_success_af0ef58c.wav",
      text: "It means soft voice.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_soft_voice_success_af0ef58c.wav",
      text: "It means soft voice.",
    },
  },
  [normalizeText("It means solve puzzle.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/teach_solve_puzzle_success_a380e811.wav",
      text: "It means solve puzzle.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/teach_solve_puzzle_success_a380e811.wav",
      text: "It means solve puzzle.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/teach_solve_puzzle_success_a380e811.wav",
      text: "It means solve puzzle.",
    },
  },
  [normalizeText("It means sort recycling.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_sort_recycling_success_d7a097f5.wav",
      text: "It means sort recycling.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_sort_recycling_success_d7a097f5.wav",
      text: "It means sort recycling.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_sort_recycling_success_d7a097f5.wav",
      text: "It means sort recycling.",
    },
  },
  [normalizeText("It means sound machine.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_sound_machine_success_4ffae0e2.wav",
      text: "It means sound machine.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_sound_machine_success_4ffae0e2.wav",
      text: "It means sound machine.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_sound_machine_success_4ffae0e2.wav",
      text: "It means sound machine.",
    },
  },
  [normalizeText("It means soup.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_soup_success_99f2ee5f.wav",
      text: "It means soup.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_soup_success_99f2ee5f.wav",
      text: "It means soup.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_soup_success_99f2ee5f.wav",
      text: "It means soup.",
    },
  },
  [normalizeText("It means spill.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_spill_success_89f5cb81.wav",
      text: "It means spill.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_spill_success_89f5cb81.wav",
      text: "It means spill.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_spill_success_89f5cb81.wav",
      text: "It means spill.",
    },
  },
  [normalizeText("It means spoon.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_spoon_success_1447d727.wav",
      text: "It means spoon.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_spoon_success_1447d727.wav",
      text: "It means spoon.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_spoon_success_1447d727.wav",
      text: "It means spoon.",
    },
  },
  [normalizeText("It means spray bottle.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_spray_bottle_success_4897f7f7.wav",
      text: "It means spray bottle.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_spray_bottle_success_4897f7f7.wav",
      text: "It means spray bottle.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_spray_bottle_success_4897f7f7.wav",
      text: "It means spray bottle.",
    },
  },
  [normalizeText("It means spray stain.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_spray_stain_success_c3f08d9f.wav",
      text: "It means spray stain.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_spray_stain_success_c3f08d9f.wav",
      text: "It means spray stain.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_spray_stain_success_c3f08d9f.wav",
      text: "It means spray stain.",
    },
  },
  [normalizeText("It means stack coasters.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_stack_coasters_success_81dfcb76.wav",
      text: "It means stack coasters.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_stack_coasters_success_81dfcb76.wav",
      text: "It means stack coasters.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_stack_coasters_success_81dfcb76.wav",
      text: "It means stack coasters.",
    },
  },
  [normalizeText("It means stain.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/teach_stain_success_c948a334.wav",
      text: "It means stain.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/teach_stain_success_c948a334.wav",
      text: "It means stain.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/teach_stain_success_c948a334.wav",
      text: "It means stain.",
    },
  },
  [normalizeText("It means star projector.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/teach_star_projector_success_5fd6d12f.wav",
      text: "It means star projector.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/teach_star_projector_success_5fd6d12f.wav",
      text: "It means star projector.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/teach_star_projector_success_5fd6d12f.wav",
      text: "It means star projector.",
    },
  },
  [normalizeText("It means start timer.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_start_timer_success_de522cb6.wav",
      text: "It means start timer.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_start_timer_success_de522cb6.wav",
      text: "It means start timer.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_start_timer_success_de522cb6.wav",
      text: "It means start timer.",
    },
  },
  [normalizeText("It means step onto mat.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_step_onto_mat_success_62e2fdef.wav",
      text: "It means step onto mat.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_step_onto_mat_success_62e2fdef.wav",
      text: "It means step onto mat.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_step_onto_mat_success_62e2fdef.wav",
      text: "It means step onto mat.",
    },
  },
  [normalizeText("It means story shelf.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_story_shelf_success_13e05e27.wav",
      text: "It means story shelf.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_story_shelf_success_13e05e27.wav",
      text: "It means story shelf.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_story_shelf_success_13e05e27.wav",
      text: "It means story shelf.",
    },
  },
  [normalizeText("It means storybook.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/teach_storybook_success_1277c9f0.wav",
      text: "It means storybook.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/teach_storybook_success_1277c9f0.wav",
      text: "It means storybook.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/teach_storybook_success_1277c9f0.wav",
      text: "It means storybook.",
    },
  },
  [normalizeText("It means straw.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_straw_success_e328686d.wav",
      text: "It means straw.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_straw_success_e328686d.wav",
      text: "It means straw.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_straw_success_e328686d.wav",
      text: "It means straw.",
    },
  },
  [normalizeText("It means sun.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/teach_sun_success_cecc308c.wav",
      text: "It means sun.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/teach_sun_success_cecc308c.wav",
      text: "It means sun.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/teach_sun_success_cecc308c.wav",
      text: "It means sun.",
    },
  },
  [normalizeText("It means swing.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_swing_success_5e87f52e.wav",
      text: "It means swing.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_swing_success_5e87f52e.wav",
      text: "It means swing.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_swing_success_5e87f52e.wav",
      text: "It means swing.",
    },
  },
  [normalizeText("It means table.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/lunchtable_teach_table_success_9904cc18.wav",
      text: "It means table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/lunchtable_teach_table_success_9904cc18.wav",
      text: "It means table.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/lunchtable_teach_table_success_9904cc18.wav",
      text: "It means table.",
    },
  },
  [normalizeText("It means take a bite.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_take_bite_success_0e832344.wav",
      text: "It means take a bite.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_take_bite_success_0e832344.wav",
      text: "It means take a bite.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_take_bite_success_0e832344.wav",
      text: "It means take a bite.",
    },
  },
  [normalizeText("It means take off shoes.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/teach_take_off_shoes_success_e986c03c.wav",
      text: "It means take off shoes.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/teach_take_off_shoes_success_e986c03c.wav",
      text: "It means take off shoes.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/teach_take_off_shoes_success_e986c03c.wav",
      text: "It means take off shoes.",
    },
  },
  [normalizeText("It means take turns.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/teach_take_turns_success_de10bf58.wav",
      text: "It means take turns.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/teach_take_turns_success_de10bf58.wav",
      text: "It means take turns.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/teach_take_turns_success_de10bf58.wav",
      text: "It means take turns.",
    },
  },
  [normalizeText("It means teacher.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teach_teacher_success_6a1a7f3c.wav",
      text: "It means teacher.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teach_teacher_success_6a1a7f3c.wav",
      text: "It means teacher.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teach_teacher_success_6a1a7f3c.wav",
      text: "It means teacher.",
    },
  },
  [normalizeText("It means throw away wrapper.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/teach_throw_away_wrapper_success_a74e998c.wav",
      text: "It means throw away wrapper.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/teach_throw_away_wrapper_success_a74e998c.wav",
      text: "It means throw away wrapper.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/teach_throw_away_wrapper_success_a74e998c.wav",
      text: "It means throw away wrapper.",
    },
  },
  [normalizeText("It means tidy room.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/teach_tidy_room_success_2410b28a.wav",
      text: "It means tidy room.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/teach_tidy_room_success_2410b28a.wav",
      text: "It means tidy room.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/teach_tidy_room_success_2410b28a.wav",
      text: "It means tidy room.",
    },
  },
  [normalizeText("It means timer.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/teach_timer_success_3db92a1a.wav",
      text: "It means timer.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/teach_timer_success_3db92a1a.wav",
      text: "It means timer.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/teach_timer_success_3db92a1a.wav",
      text: "It means timer.",
    },
  },
  [normalizeText("It means tongs.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/teach_tongs_success_9ef9a64d.wav",
      text: "It means tongs.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/teach_tongs_success_9ef9a64d.wav",
      text: "It means tongs.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/teach_tongs_success_9ef9a64d.wav",
      text: "It means tongs.",
    },
  },
  [normalizeText("It means toothbrush.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_toothbrush_success_92525ae3.wav",
      text: "It means toothbrush.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_toothbrush_success_92525ae3.wav",
      text: "It means toothbrush.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_toothbrush_success_92525ae3.wav",
      text: "It means toothbrush.",
    },
  },
  [normalizeText("It means toothpaste.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_toothpaste_success_50431e82.wav",
      text: "It means toothpaste.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_toothpaste_success_50431e82.wav",
      text: "It means toothpaste.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_toothpaste_success_50431e82.wav",
      text: "It means toothpaste.",
    },
  },
  [normalizeText("It means towel.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_towel_success_d9f0f9fb.wav",
      text: "It means towel.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_towel_success_d9f0f9fb.wav",
      text: "It means towel.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_towel_success_d9f0f9fb.wav",
      text: "It means towel.",
    },
  },
  [normalizeText("It means toy.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_toy_success_58d64189.wav",
      text: "It means toy.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_toy_success_58d64189.wav",
      text: "It means toy.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_toy_success_58d64189.wav",
      text: "It means toy.",
    },
  },
  [normalizeText("It means traffic light.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_traffic_light_success_415d1ec3.wav",
      text: "It means traffic light.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_traffic_light_success_415d1ec3.wav",
      text: "It means traffic light.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_traffic_light_success_415d1ec3.wav",
      text: "It means traffic light.",
    },
  },
  [normalizeText("It means trash bin.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/cleanup_teach_trash_bin_success_6d5f132a.wav",
      text: "It means trash bin.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/cleanup_teach_trash_bin_success_6d5f132a.wav",
      text: "It means trash bin.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/cleanup_teach_trash_bin_success_6d5f132a.wav",
      text: "It means trash bin.",
    },
  },
  [normalizeText("It means tray.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/teach_tray_success_5bcf72a0.wav",
      text: "It means tray.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/teach_tray_success_5bcf72a0.wav",
      text: "It means tray.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/teach_tray_success_5bcf72a0.wav",
      text: "It means tray.",
    },
  },
  [normalizeText("It means try vegetables.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_try_vegetables_success_a4143e46.wav",
      text: "It means try vegetables.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_try_vegetables_success_a4143e46.wav",
      text: "It means try vegetables.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_try_vegetables_success_a4143e46.wav",
      text: "It means try vegetables.",
    },
  },
  [normalizeText("It means turn on shower.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/teach_turn_on_shower_success_2cc62946.wav",
      text: "It means turn on shower.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/teach_turn_on_shower_success_2cc62946.wav",
      text: "It means turn on shower.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/teach_turn_on_shower_success_2cc62946.wav",
      text: "It means turn on shower.",
    },
  },
  [normalizeText("It means uniform.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school_teach_uniform_success_5bf0f97a.wav",
      text: "It means uniform.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school_teach_uniform_success_5bf0f97a.wav",
      text: "It means uniform.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school_teach_uniform_success_5bf0f97a.wav",
      text: "It means uniform.",
    },
  },
  [normalizeText("It means use spoon.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/lunchbox_teach_use_spoon_success_6ca0c9e4.wav",
      text: "It means use spoon.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/lunchbox_teach_use_spoon_success_6ca0c9e4.wav",
      text: "It means use spoon.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/lunchbox_teach_use_spoon_success_6ca0c9e4.wav",
      text: "It means use spoon.",
    },
  },
  [normalizeText("It means vegetables.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/teach_vegetables_success_94effe1b.wav",
      text: "It means vegetables.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/teach_vegetables_success_94effe1b.wav",
      text: "It means vegetables.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/teach_vegetables_success_94effe1b.wav",
      text: "It means vegetables.",
    },
  },
  [normalizeText("It means wait.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/games_teach_wait_success_eb32d6b8.wav",
      text: "It means wait.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/games_teach_wait_success_eb32d6b8.wav",
      text: "It means wait.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/games_teach_wait_success_eb32d6b8.wav",
      text: "It means wait.",
    },
  },
  [normalizeText("It means wash face.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_wash_face_success_ccb65426.wav",
      text: "It means wash face.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_wash_face_success_ccb65426.wav",
      text: "It means wash face.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_wash_face_success_ccb65426.wav",
      text: "It means wash face.",
    },
  },
  [normalizeText("It means wash hands.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/cleanup_teach_wash_hands_success_bea20d94.wav",
      text: "It means wash hands.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/cleanup_teach_wash_hands_success_bea20d94.wav",
      text: "It means wash hands.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/cleanup_teach_wash_hands_success_bea20d94.wav",
      text: "It means wash hands.",
    },
  },
  [normalizeText("It means water.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/teach_water_success_f10d0576.wav",
      text: "It means water.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/teach_water_success_f10d0576.wav",
      text: "It means water.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/teach_water_success_f10d0576.wav",
      text: "It means water.",
    },
  },
  [normalizeText("It means wear sleep mask.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/teach_wear_sleep_mask_success_b1076843.wav",
      text: "It means wear sleep mask.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/teach_wear_sleep_mask_success_b1076843.wav",
      text: "It means wear sleep mask.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/teach_wear_sleep_mask_success_b1076843.wav",
      text: "It means wear sleep mask.",
    },
  },
  [normalizeText("It means window.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/teach_window_success_a1dab91d.wav",
      text: "It means window.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/teach_window_success_a1dab91d.wav",
      text: "It means window.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/teach_window_success_a1dab91d.wav",
      text: "It means window.",
    },
  },
  [normalizeText("It means wipe mouth.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/teach_wipe_mouth_success_2ffe94d8.wav",
      text: "It means wipe mouth.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/teach_wipe_mouth_success_2ffe94d8.wav",
      text: "It means wipe mouth.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/teach_wipe_mouth_success_2ffe94d8.wav",
      text: "It means wipe mouth.",
    },
  },
  [normalizeText("It means wipe table.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/cleanup_teach_wipe_table_success_7805bd79.wav",
      text: "It means wipe table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/cleanup_teach_wipe_table_success_7805bd79.wav",
      text: "It means wipe table.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/cleanup_teach_wipe_table_success_7805bd79.wav",
      text: "It means wipe table.",
    },
  },
  [normalizeText("It means wrapper.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/teach_wrapper_success_89ef1feb.wav",
      text: "It means wrapper.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/teach_wrapper_success_89ef1feb.wav",
      text: "It means wrapper.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/teach_wrapper_success_89ef1feb.wav",
      text: "It means wrapper.",
    },
  },
  [normalizeText("It means write your name.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/supplies_teach_write_name_success_7e718e70.wav",
      text: "It means write your name.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/supplies_teach_write_name_success_7e718e70.wav",
      text: "It means write your name.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/supplies_teach_write_name_success_7e718e70.wav",
      text: "It means write your name.",
    },
  },
  [normalizeText("It means yogurt.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/teach_yogurt_success_b70fc395.wav",
      text: "It means yogurt.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/teach_yogurt_success_b70fc395.wav",
      text: "It means yogurt.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/teach_yogurt_success_b70fc395.wav",
      text: "It means yogurt.",
    },
  },
  [normalizeText("jacket")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/jacket.wav",
      text: "jacket",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/jacket.wav",
      text: "jacket",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/jacket.wav",
      text: "jacket",
    },
  },
  [normalizeText("juice")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/juice.wav",
      text: "juice",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/juice.wav",
      text: "juice",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/juice.wav",
      text: "juice",
    },
  },
  [normalizeText("jump")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/jump.wav",
      text: "jump",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/jump.wav",
      text: "jump",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/jump.wav",
      text: "jump",
    },
  },
  [normalizeText("kitchen counter")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/kitchen_counter.wav",
      text: "kitchen counter",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/kitchen_counter.wav",
      text: "kitchen counter",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/kitchen_counter.wav",
      text: "kitchen counter",
    },
  },
  [normalizeText("kite")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/kite.wav",
      text: "kite",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/kite.wav",
      text: "kite",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/kite.wav",
      text: "kite",
    },
  },
  [normalizeText("knee")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/knee.wav",
      text: "knee",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/knee.wav",
      text: "knee",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/knee.wav",
      text: "knee",
    },
  },
  [normalizeText("label")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/label.wav",
      text: "label",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/label.wav",
      text: "label",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/label.wav",
      text: "label",
    },
  },
  [normalizeText("label container")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/label_container.wav",
      text: "label container",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/label_container.wav",
      text: "label container",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/label_container.wav",
      text: "label container",
    },
  },
  [normalizeText("Label container.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_drag_label_to_container_32f55dad.wav",
      text: "Label container.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_drag_label_to_container_32f55dad.wav",
      text: "Label container.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_drag_label_to_container_32f55dad.wav",
      text: "Label container.",
    },
  },
  [normalizeText("Label.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_tap_label_d699da71.wav",
      text: "Label.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_tap_label_d699da71.wav",
      text: "Label.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_tap_label_d699da71.wav",
      text: "Label.",
    },
  },
  [normalizeText("ladle")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/ladle.wav",
      text: "ladle",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/ladle.wav",
      text: "ladle",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/ladle.wav",
      text: "ladle",
    },
  },
  [normalizeText("lamp")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/lamp.wav",
      text: "lamp",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/lamp.wav",
      text: "lamp",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/lamp.wav",
      text: "lamp",
    },
  },
  [normalizeText("laundry basket")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/laundry_basket.wav",
      text: "laundry basket",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/laundry_basket.wav",
      text: "laundry basket",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/laundry_basket.wav",
      text: "laundry basket",
    },
  },
  [normalizeText("leftovers")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/leftovers.wav",
      text: "leftovers",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/leftovers.wav",
      text: "leftovers",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/leftovers.wav",
      text: "leftovers",
    },
  },
  [normalizeText("Let us eat!")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_intro_ea939b15.wav",
      text: "Let us eat!",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_intro_ea939b15.wav",
      text: "Let us eat!",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_intro_ea939b15.wav",
      text: "Let us eat!",
    },
  },
  [normalizeText("Let's learn air dry dishes.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_air_dry_dishes_986abf5f.wav",
      text: "Let's learn air dry dishes.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_air_dry_dishes_986abf5f.wav",
      text: "Let's learn air dry dishes.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_air_dry_dishes_986abf5f.wav",
      text: "Let's learn air dry dishes.",
    },
  },
  [normalizeText("Let's learn arrive home.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_arrive_home_cd4e8fa9.wav",
      text: "Let's learn arrive home.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_arrive_home_cd4e8fa9.wav",
      text: "Let's learn arrive home.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_arrive_home_cd4e8fa9.wav",
      text: "Let's learn arrive home.",
    },
  },
  [normalizeText("Let's learn bite.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_bite_1f4d78ad.wav",
      text: "Let's learn bite.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_bite_1f4d78ad.wav",
      text: "Let's learn bite.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_bite_1f4d78ad.wav",
      text: "Let's learn bite.",
    },
  },
  [normalizeText("Let's learn brush teeth.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_brush_teeth_d24735b1.wav",
      text: "Let's learn brush teeth.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_brush_teeth_d24735b1.wav",
      text: "Let's learn brush teeth.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_brush_teeth_d24735b1.wav",
      text: "Let's learn brush teeth.",
    },
  },
  [normalizeText("Let's learn buckle up.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_buckle_up_fae5c78d.wav",
      text: "Let's learn buckle up.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_buckle_up_fae5c78d.wav",
      text: "Let's learn buckle up.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_buckle_up_fae5c78d.wav",
      text: "Let's learn buckle up.",
    },
  },
  [normalizeText("Let's learn build tower.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_teach_build_tower_fcabac48.wav",
      text: "Let's learn build tower.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_teach_build_tower_fcabac48.wav",
      text: "Let's learn build tower.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_teach_build_tower_fcabac48.wav",
      text: "Let's learn build tower.",
    },
  },
  [normalizeText("Let's learn call everyone.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_call_everyone_ee23345b.wav",
      text: "Let's learn call everyone.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_call_everyone_ee23345b.wav",
      text: "Let's learn call everyone.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_call_everyone_ee23345b.wav",
      text: "Let's learn call everyone.",
    },
  },
  [normalizeText("Let's learn carry tray.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_carry_tray_4286e3f5.wav",
      text: "Let's learn carry tray.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_carry_tray_4286e3f5.wav",
      text: "Let's learn carry tray.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_carry_tray_4286e3f5.wav",
      text: "Let's learn carry tray.",
    },
  },
  [normalizeText("Let's learn check dream journal.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_check_dream_journal_ec7abc16.wav",
      text: "Let's learn check dream journal.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_check_dream_journal_ec7abc16.wav",
      text: "Let's learn check dream journal.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_check_dream_journal_ec7abc16.wav",
      text: "Let's learn check dream journal.",
    },
  },
  [normalizeText("Let's learn check temperature.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_check_temperature_493b1652.wav",
      text: "Let's learn check temperature.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_check_temperature_493b1652.wav",
      text: "Let's learn check temperature.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_check_temperature_493b1652.wav",
      text: "Let's learn check temperature.",
    },
  },
  [normalizeText("Let's learn choose snack.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_choose_snack_e0fa7dd4.wav",
      text: "Let's learn choose snack.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_choose_snack_e0fa7dd4.wav",
      text: "Let's learn choose snack.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_choose_snack_e0fa7dd4.wav",
      text: "Let's learn choose snack.",
    },
  },
  [normalizeText("Let's learn choose story.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_choose_story_bef74185.wav",
      text: "Let's learn choose story.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_choose_story_bef74185.wav",
      text: "Let's learn choose story.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_choose_story_bef74185.wav",
      text: "Let's learn choose story.",
    },
  },
  [normalizeText("Let's learn choose toy.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_teach_choose_toy_ff8c33e4.wav",
      text: "Let's learn choose toy.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_teach_choose_toy_ff8c33e4.wav",
      text: "Let's learn choose toy.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_teach_choose_toy_ff8c33e4.wav",
      text: "Let's learn choose toy.",
    },
  },
  [normalizeText("Let's learn clean up toys.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_teach_clean_up_toys_ccc94d31.wav",
      text: "Let's learn clean up toys.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_clean_up_toys_ccc94d31.wav",
      text: "Let's learn clean up toys.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_teach_clean_up_toys_ccc94d31.wav",
      text: "Let's learn clean up toys.",
    },
  },
  [normalizeText("Let's learn clean up.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_teach_clean_up_e43fa027.wav",
      text: "Let's learn clean up.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_teach_clean_up_e43fa027.wav",
      text: "Let's learn clean up.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_teach_clean_up_e43fa027.wav",
      text: "Let's learn clean up.",
    },
  },
  [normalizeText("Let's learn close curtains.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_close_curtains_c543a3db.wav",
      text: "Let's learn close curtains.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_close_curtains_c543a3db.wav",
      text: "Let's learn close curtains.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_close_curtains_c543a3db.wav",
      text: "Let's learn close curtains.",
    },
  },
  [normalizeText("Let's learn comb hair.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_comb_hair_a37bef36.wav",
      text: "Let's learn comb hair.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_comb_hair_a37bef36.wav",
      text: "Let's learn comb hair.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_comb_hair_a37bef36.wav",
      text: "Let's learn comb hair.",
    },
  },
  [normalizeText("Let's learn dim lights.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_dim_lights_86a1b186.wav",
      text: "Let's learn dim lights.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_dim_lights_86a1b186.wav",
      text: "Let's learn dim lights.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_dim_lights_86a1b186.wav",
      text: "Let's learn dim lights.",
    },
  },
  [normalizeText("Let's learn draw a circle.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_draw_circle_d65d9e1f.wav",
      text: "Let's learn draw a circle.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_draw_circle_d65d9e1f.wav",
      text: "Let's learn draw a circle.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_draw_circle_d65d9e1f.wav",
      text: "Let's learn draw a circle.",
    },
  },
  [normalizeText("Let's learn draw picture.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_draw_picture_eead8426.wav",
      text: "Let's learn draw picture.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_draw_picture_eead8426.wav",
      text: "Let's learn draw picture.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_draw_picture_eead8426.wav",
      text: "Let's learn draw picture.",
    },
  },
  [normalizeText("Let's learn drink water.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_drink_water_51cc6846.wav",
      text: "Let's learn drink water.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_drink_water_51cc6846.wav",
      text: "Let's learn drink water.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_drink_water_51cc6846.wav",
      text: "Let's learn drink water.",
    },
  },
  [normalizeText("Let's learn dry face.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_dry_face_3d7e965a.wav",
      text: "Let's learn dry face.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_dry_face_3d7e965a.wav",
      text: "Let's learn dry face.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_dry_face_3d7e965a.wav",
      text: "Let's learn dry face.",
    },
  },
  [normalizeText("Let's learn dry surface.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_dry_surface_eade10ff.wav",
      text: "Let's learn dry surface.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_dry_surface_eade10ff.wav",
      text: "Let's learn dry surface.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_dry_surface_eade10ff.wav",
      text: "Let's learn dry surface.",
    },
  },
  [normalizeText("Let's learn eat breakfast.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_eat_breakfast_25224593.wav",
      text: "Let's learn eat breakfast.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_eat_breakfast_25224593.wav",
      text: "Let's learn eat breakfast.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_eat_breakfast_25224593.wav",
      text: "Let's learn eat breakfast.",
    },
  },
  [normalizeText("Let's learn eat lunch.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_eat_lunch_05613169.wav",
      text: "Let's learn eat lunch.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_eat_lunch_05613169.wav",
      text: "Let's learn eat lunch.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_eat_lunch_05613169.wav",
      text: "Let's learn eat lunch.",
    },
  },
  [normalizeText("Let's learn eat snack.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_eat_snack_915b05ce.wav",
      text: "Let's learn eat snack.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_eat_snack_915b05ce.wav",
      text: "Let's learn eat snack.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_eat_snack_915b05ce.wav",
      text: "Let's learn eat snack.",
    },
  },
  [normalizeText("Let's learn get on bus.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_get_on_bus_4a961618.wav",
      text: "Let's learn get on bus.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_get_on_bus_4a961618.wav",
      text: "Let's learn get on bus.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_get_on_bus_4a961618.wav",
      text: "Let's learn get on bus.",
    },
  },
  [normalizeText("Let's learn go to school.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_go_to_school_d5887b45.wav",
      text: "Let's learn go to school.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_go_to_school_d5887b45.wav",
      text: "Let's learn go to school.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_go_to_school_d5887b45.wav",
      text: "Let's learn go to school.",
    },
  },
  [normalizeText("Let's learn good morning.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_good_morning_8b346be0.wav",
      text: "Let's learn good morning.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_good_morning_8b346be0.wav",
      text: "Let's learn good morning.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_good_morning_8b346be0.wav",
      text: "Let's learn good morning.",
    },
  },
  [normalizeText("Let's learn hang robe.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_hang_robe_10a94a90.wav",
      text: "Let's learn hang robe.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_hang_robe_10a94a90.wav",
      text: "Let's learn hang robe.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_hang_robe_10a94a90.wav",
      text: "Let's learn hang robe.",
    },
  },
  [normalizeText("Let's learn hug comfort plush.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_hug_comfort_plush_46b319c9.wav",
      text: "Let's learn hug comfort plush.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_hug_comfort_plush_46b319c9.wav",
      text: "Let's learn hug comfort plush.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_hug_comfort_plush_46b319c9.wav",
      text: "Let's learn hug comfort plush.",
    },
  },
  [normalizeText("Let's learn hug family.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_teach_hug_family_63f950a0.wav",
      text: "Let's learn hug family.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_teach_hug_family_63f950a0.wav",
      text: "Let's learn hug family.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_teach_hug_family_63f950a0.wav",
      text: "Let's learn hug family.",
    },
  },
  [normalizeText("Let's learn jump.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_jump_f3e93940.wav",
      text: "Let's learn jump.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_jump_f3e93940.wav",
      text: "Let's learn jump.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_jump_f3e93940.wav",
      text: "Let's learn jump.",
    },
  },
  [normalizeText("Let's learn label container.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_label_container_3a1b1a7e.wav",
      text: "Let's learn label container.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_label_container_3a1b1a7e.wav",
      text: "Let's learn label container.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_label_container_3a1b1a7e.wav",
      text: "Let's learn label container.",
    },
  },
  [normalizeText("Let's learn line up.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_teach_line_up_3aaa7e8b.wav",
      text: "Let's learn line up.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_teach_line_up_3aaa7e8b.wav",
      text: "Let's learn line up.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_teach_line_up_3aaa7e8b.wav",
      text: "Let's learn line up.",
    },
  },
  [normalizeText("Let's learn listen.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_teach_listen_db748663.wav",
      text: "Let's learn listen.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_teach_listen_db748663.wav",
      text: "Let's learn listen.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_teach_listen_db748663.wav",
      text: "Let's learn listen.",
    },
  },
  [normalizeText("Let's learn load dishwasher.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_load_dishwasher_ee67277b.wav",
      text: "Let's learn load dishwasher.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_load_dishwasher_ee67277b.wav",
      text: "Let's learn load dishwasher.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_load_dishwasher_ee67277b.wav",
      text: "Let's learn load dishwasher.",
    },
  },
  [normalizeText("Let's learn make bubbles.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_make_bubbles_f2c23486.wav",
      text: "Let's learn make bubbles.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_make_bubbles_f2c23486.wav",
      text: "Let's learn make bubbles.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_make_bubbles_f2c23486.wav",
      text: "Let's learn make bubbles.",
    },
  },
  [normalizeText("Let's learn make the bed.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_make_the_bed_5a747af8.wav",
      text: "Let's learn make the bed.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_make_the_bed_5a747af8.wav",
      text: "Let's learn make the bed.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_make_the_bed_5a747af8.wav",
      text: "Let's learn make the bed.",
    },
  },
  [normalizeText("Let's learn move cart.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_move_cart_5fd39972.wav",
      text: "Let's learn move cart.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_move_cart_5fd39972.wav",
      text: "Let's learn move cart.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_move_cart_5fd39972.wav",
      text: "Let's learn move cart.",
    },
  },
  [normalizeText("Let's learn open book.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_open_book_458b4985.wav",
      text: "Let's learn open book.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_open_book_458b4985.wav",
      text: "Let's learn open book.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_open_book_458b4985.wav",
      text: "Let's learn open book.",
    },
  },
  [normalizeText("Let's learn open lunchbox.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_open_lunchbox_07dadd3d.wav",
      text: "Let's learn open lunchbox.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_open_lunchbox_07dadd3d.wav",
      text: "Let's learn open lunchbox.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_open_lunchbox_07dadd3d.wav",
      text: "Let's learn open lunchbox.",
    },
  },
  [normalizeText("Let's learn open snack box.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_open_snack_box_ce78b78d.wav",
      text: "Let's learn open snack box.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_open_snack_box_ce78b78d.wav",
      text: "Let's learn open snack box.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_open_snack_box_ce78b78d.wav",
      text: "Let's learn open snack box.",
    },
  },
  [normalizeText("Let's learn pack bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_pack_bag_d4502afa.wav",
      text: "Let's learn pack bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_pack_bag_d4502afa.wav",
      text: "Let's learn pack bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_pack_bag_d4502afa.wav",
      text: "Let's learn pack bag.",
    },
  },
  [normalizeText("Let's learn pass dish.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_pass_dish_a9481e4a.wav",
      text: "Let's learn pass dish.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_pass_dish_a9481e4a.wav",
      text: "Let's learn pass dish.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_pass_dish_a9481e4a.wav",
      text: "Let's learn pass dish.",
    },
  },
  [normalizeText("Let's learn place bookmark.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_place_bookmark_1cfc9c6e.wav",
      text: "Let's learn place bookmark.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_place_bookmark_1cfc9c6e.wav",
      text: "Let's learn place bookmark.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_place_bookmark_1cfc9c6e.wav",
      text: "Let's learn place bookmark.",
    },
  },
  [normalizeText("Let's learn play gently.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_teach_play_gently_cd327303.wav",
      text: "Let's learn play gently.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_teach_play_gently_cd327303.wav",
      text: "Let's learn play gently.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_teach_play_gently_cd327303.wav",
      text: "Let's learn play gently.",
    },
  },
  [normalizeText("Let's learn play lullaby.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_play_lullaby_d807d1fa.wav",
      text: "Let's learn play lullaby.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_play_lullaby_d807d1fa.wav",
      text: "Let's learn play lullaby.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_play_lullaby_d807d1fa.wav",
      text: "Let's learn play lullaby.",
    },
  },
  [normalizeText("Let's learn play together.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_play_together_cdb6f560.wav",
      text: "Let's learn play together.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_play_together_cdb6f560.wav",
      text: "Let's learn play together.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_play_together_cdb6f560.wav",
      text: "Let's learn play together.",
    },
  },
  [normalizeText("Let's learn pour juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_pour_juice_1a657617.wav",
      text: "Let's learn pour juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_pour_juice_1a657617.wav",
      text: "Let's learn pour juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_pour_juice_1a657617.wav",
      text: "Let's learn pour juice.",
    },
  },
  [normalizeText("Let's learn pour milk.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_pour_milk_6474651f.wav",
      text: "Let's learn pour milk.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_pour_milk_6474651f.wav",
      text: "Let's learn pour milk.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_pour_milk_6474651f.wav",
      text: "Let's learn pour milk.",
    },
  },
  [normalizeText("Let's learn put away book.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_teach_put_away_book_8bacc17c.wav",
      text: "Let's learn put away book.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_put_away_book_8bacc17c.wav",
      text: "Let's learn put away book.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_teach_put_away_book_8bacc17c.wav",
      text: "Let's learn put away book.",
    },
  },
  [normalizeText("Let's learn put away tray.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_teach_put_away_tray_61d803e9.wav",
      text: "Let's learn put away tray.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_put_away_tray_61d803e9.wav",
      text: "Let's learn put away tray.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_teach_put_away_tray_61d803e9.wav",
      text: "Let's learn put away tray.",
    },
  },
  [normalizeText("Let's learn put on pajamas.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_put_on_pajamas_c4497120.wav",
      text: "Let's learn put on pajamas.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_put_on_pajamas_c4497120.wav",
      text: "Let's learn put on pajamas.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_put_on_pajamas_c4497120.wav",
      text: "Let's learn put on pajamas.",
    },
  },
  [normalizeText("Let's learn put on shoes.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_put_on_shoes_4ca32152.wav",
      text: "Let's learn put on shoes.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_put_on_shoes_4ca32152.wav",
      text: "Let's learn put on shoes.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_put_on_shoes_4ca32152.wav",
      text: "Let's learn put on shoes.",
    },
  },
  [normalizeText("Let's learn raise hand.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_raise_hand_237d9da9.wav",
      text: "Let's learn raise hand.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_raise_hand_237d9da9.wav",
      text: "Let's learn raise hand.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_raise_hand_237d9da9.wav",
      text: "Let's learn raise hand.",
    },
  },
  [normalizeText("Let's learn read book.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_read_book_a1192359.wav",
      text: "Let's learn read book.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_read_book_a1192359.wav",
      text: "Let's learn read book.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_read_book_a1192359.wav",
      text: "Let's learn read book.",
    },
  },
  [normalizeText("Let's learn read softly.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_read_softly_7b765de5.wav",
      text: "Let's learn read softly.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_read_softly_7b765de5.wav",
      text: "Let's learn read softly.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_read_softly_7b765de5.wav",
      text: "Let's learn read softly.",
    },
  },
  [normalizeText("Let's learn rest.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_rest_bfbd3ac7.wav",
      text: "Let's learn rest.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_rest_bfbd3ac7.wav",
      text: "Let's learn rest.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_rest_bfbd3ac7.wav",
      text: "Let's learn rest.",
    },
  },
  [normalizeText("Let's learn rinse hair.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_rinse_hair_28ca6154.wav",
      text: "Let's learn rinse hair.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_rinse_hair_28ca6154.wav",
      text: "Let's learn rinse hair.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_rinse_hair_28ca6154.wav",
      text: "Let's learn rinse hair.",
    },
  },
  [normalizeText("Let's learn run.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_run_d44351cf.wav",
      text: "Let's learn run.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_run_d44351cf.wav",
      text: "Let's learn run.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_run_d44351cf.wav",
      text: "Let's learn run.",
    },
  },
  [normalizeText("Let's learn save leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_save_leftovers_e0290b41.wav",
      text: "Let's learn save leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_save_leftovers_e0290b41.wav",
      text: "Let's learn save leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_save_leftovers_e0290b41.wav",
      text: "Let's learn save leftovers.",
    },
  },
  [normalizeText("Let's learn say good night.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_say_good_night_7604cf8c.wav",
      text: "Let's learn say good night.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_say_good_night_7604cf8c.wav",
      text: "Let's learn say good night.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_say_good_night_7604cf8c.wav",
      text: "Let's learn say good night.",
    },
  },
  [normalizeText("Let's learn say goodbye.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_teach_say_goodbye_7139576c.wav",
      text: "Let's learn say goodbye.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_teach_say_goodbye_7139576c.wav",
      text: "Let's learn say goodbye.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_teach_say_goodbye_7139576c.wav",
      text: "Let's learn say goodbye.",
    },
  },
  [normalizeText("Let's learn say thank you.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_teach_say_thank_you_c727d352.wav",
      text: "Let's learn say thank you.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_teach_say_thank_you_c727d352.wav",
      text: "Let's learn say thank you.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_teach_say_thank_you_c727d352.wav",
      text: "Let's learn say thank you.",
    },
  },
  [normalizeText("Let's learn scrub knees.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_scrub_knees_08fb9178.wav",
      text: "Let's learn scrub knees.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_scrub_knees_08fb9178.wav",
      text: "Let's learn scrub knees.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_scrub_knees_08fb9178.wav",
      text: "Let's learn scrub knees.",
    },
  },
  [normalizeText("Let's learn scrub spot.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_scrub_spot_554d25f8.wav",
      text: "Let's learn scrub spot.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_scrub_spot_554d25f8.wav",
      text: "Let's learn scrub spot.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_scrub_spot_554d25f8.wav",
      text: "Let's learn scrub spot.",
    },
  },
  [normalizeText("Let's learn serve noodles.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_serve_noodles_c95adc07.wav",
      text: "Let's learn serve noodles.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_serve_noodles_c95adc07.wav",
      text: "Let's learn serve noodles.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_serve_noodles_c95adc07.wav",
      text: "Let's learn serve noodles.",
    },
  },
  [normalizeText("Let's learn set placemat.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_set_placemat_7ae1fcea.wav",
      text: "Let's learn set placemat.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_set_placemat_7ae1fcea.wav",
      text: "Let's learn set placemat.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_set_placemat_7ae1fcea.wav",
      text: "Let's learn set placemat.",
    },
  },
  [normalizeText("Let's learn share food.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_teach_share_food_4f8aeed9.wav",
      text: "Let's learn share food.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_teach_share_food_4f8aeed9.wav",
      text: "Let's learn share food.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_teach_share_food_4f8aeed9.wav",
      text: "Let's learn share food.",
    },
  },
  [normalizeText("Let's learn share toys.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_share_toys_4b4cbef2.wav",
      text: "Let's learn share toys.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_share_toys_4b4cbef2.wav",
      text: "Let's learn share toys.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_share_toys_4b4cbef2.wav",
      text: "Let's learn share toys.",
    },
  },
  [normalizeText("Let's learn sip juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_sip_juice_99e588ab.wav",
      text: "Let's learn sip juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_sip_juice_99e588ab.wav",
      text: "Let's learn sip juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_sip_juice_99e588ab.wav",
      text: "Let's learn sip juice.",
    },
  },
  [normalizeText("Let's learn sip.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_sip_dd6f9251.wav",
      text: "Let's learn sip.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_sip_dd6f9251.wav",
      text: "Let's learn sip.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_sip_dd6f9251.wav",
      text: "Let's learn sip.",
    },
  },
  [normalizeText("Let's learn sit at table.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_teach_sit_at_table_9e3ec062.wav",
      text: "Let's learn sit at table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_teach_sit_at_table_9e3ec062.wav",
      text: "Let's learn sit at table.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_teach_sit_at_table_9e3ec062.wav",
      text: "Let's learn sit at table.",
    },
  },
  [normalizeText("Let's learn sit down.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_sit_down_926e0aa5.wav",
      text: "Let's learn sit down.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_sit_down_926e0aa5.wav",
      text: "Let's learn sit down.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_sit_down_926e0aa5.wav",
      text: "Let's learn sit down.",
    },
  },
  [normalizeText("Let's learn soft voice.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_soft_voice_6e9890c7.wav",
      text: "Let's learn soft voice.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_soft_voice_6e9890c7.wav",
      text: "Let's learn soft voice.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_soft_voice_6e9890c7.wav",
      text: "Let's learn soft voice.",
    },
  },
  [normalizeText("Let's learn solve puzzle.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_solve_puzzle_f7efabb0.wav",
      text: "Let's learn solve puzzle.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_solve_puzzle_f7efabb0.wav",
      text: "Let's learn solve puzzle.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_solve_puzzle_f7efabb0.wav",
      text: "Let's learn solve puzzle.",
    },
  },
  [normalizeText("Let's learn sort recycling.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_sort_recycling_2e1a833e.wav",
      text: "Let's learn sort recycling.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_sort_recycling_2e1a833e.wav",
      text: "Let's learn sort recycling.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_sort_recycling_2e1a833e.wav",
      text: "Let's learn sort recycling.",
    },
  },
  [normalizeText("Let's learn spray stain.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_spray_stain_c7b058f5.wav",
      text: "Let's learn spray stain.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_spray_stain_c7b058f5.wav",
      text: "Let's learn spray stain.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_spray_stain_c7b058f5.wav",
      text: "Let's learn spray stain.",
    },
  },
  [normalizeText("Let's learn stack coasters.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_stack_coasters_cf8e0aa3.wav",
      text: "Let's learn stack coasters.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_stack_coasters_cf8e0aa3.wav",
      text: "Let's learn stack coasters.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_stack_coasters_cf8e0aa3.wav",
      text: "Let's learn stack coasters.",
    },
  },
  [normalizeText("Let's learn start timer.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_start_timer_d0ba3723.wav",
      text: "Let's learn start timer.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_start_timer_d0ba3723.wav",
      text: "Let's learn start timer.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_start_timer_d0ba3723.wav",
      text: "Let's learn start timer.",
    },
  },
  [normalizeText("Let's learn step onto mat.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_step_onto_mat_9214cbe9.wav",
      text: "Let's learn step onto mat.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_step_onto_mat_9214cbe9.wav",
      text: "Let's learn step onto mat.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_step_onto_mat_9214cbe9.wav",
      text: "Let's learn step onto mat.",
    },
  },
  [normalizeText("Let's learn take a bite.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_take_bite_518873d0.wav",
      text: "Let's learn take a bite.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_take_bite_518873d0.wav",
      text: "Let's learn take a bite.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_take_bite_518873d0.wav",
      text: "Let's learn take a bite.",
    },
  },
  [normalizeText("Let's learn take off shoes.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_teach_take_off_shoes_f67fd399.wav",
      text: "Let's learn take off shoes.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_teach_take_off_shoes_f67fd399.wav",
      text: "Let's learn take off shoes.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_teach_take_off_shoes_f67fd399.wav",
      text: "Let's learn take off shoes.",
    },
  },
  [normalizeText("Let's learn take turns.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_take_turns_57a9d396.wav",
      text: "Let's learn take turns.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_take_turns_57a9d396.wav",
      text: "Let's learn take turns.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_take_turns_57a9d396.wav",
      text: "Let's learn take turns.",
    },
  },
  [normalizeText("Let's learn throw away wrapper.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_teach_throw_away_wrapper_28a415f8.wav",
      text: "Let's learn throw away wrapper.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_throw_away_wrapper_28a415f8.wav",
      text: "Let's learn throw away wrapper.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_teach_throw_away_wrapper_28a415f8.wav",
      text: "Let's learn throw away wrapper.",
    },
  },
  [normalizeText("Let's learn tidy room.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_teach_tidy_room_34454abc.wav",
      text: "Let's learn tidy room.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_tidy_room_34454abc.wav",
      text: "Let's learn tidy room.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_teach_tidy_room_34454abc.wav",
      text: "Let's learn tidy room.",
    },
  },
  [normalizeText("Let's learn try vegetables.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_try_vegetables_2a84d9e5.wav",
      text: "Let's learn try vegetables.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_try_vegetables_2a84d9e5.wav",
      text: "Let's learn try vegetables.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_try_vegetables_2a84d9e5.wav",
      text: "Let's learn try vegetables.",
    },
  },
  [normalizeText("Let's learn turn on shower.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_turn_on_shower_af3b7399.wav",
      text: "Let's learn turn on shower.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_turn_on_shower_af3b7399.wav",
      text: "Let's learn turn on shower.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_turn_on_shower_af3b7399.wav",
      text: "Let's learn turn on shower.",
    },
  },
  [normalizeText("Let's learn use spoon.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_use_spoon_da38c18b.wav",
      text: "Let's learn use spoon.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_use_spoon_da38c18b.wav",
      text: "Let's learn use spoon.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_use_spoon_da38c18b.wav",
      text: "Let's learn use spoon.",
    },
  },
  [normalizeText("Let's learn wait.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_wait_afea85d5.wav",
      text: "Let's learn wait.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_wait_afea85d5.wav",
      text: "Let's learn wait.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_wait_afea85d5.wav",
      text: "Let's learn wait.",
    },
  },
  [normalizeText("Let's learn wash face.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_wash_face_b7090b06.wav",
      text: "Let's learn wash face.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_wash_face_b7090b06.wav",
      text: "Let's learn wash face.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_wash_face_b7090b06.wav",
      text: "Let's learn wash face.",
    },
  },
  [normalizeText("Let's learn wash hands.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_teach_wash_hands_4185f132.wav",
      text: "Let's learn wash hands.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_teach_wash_hands_4185f132.wav",
      text: "Let's learn wash hands.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_teach_wash_hands_4185f132.wav",
      text: "Let's learn wash hands.",
    },
  },
  [normalizeText("Let's learn wear sleep mask.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_wear_sleep_mask_19956e57.wav",
      text: "Let's learn wear sleep mask.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_wear_sleep_mask_19956e57.wav",
      text: "Let's learn wear sleep mask.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_wear_sleep_mask_19956e57.wav",
      text: "Let's learn wear sleep mask.",
    },
  },
  [normalizeText("Let's learn wipe mouth.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_wipe_mouth_16a7f3d5.wav",
      text: "Let's learn wipe mouth.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_wipe_mouth_16a7f3d5.wav",
      text: "Let's learn wipe mouth.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_wipe_mouth_16a7f3d5.wav",
      text: "Let's learn wipe mouth.",
    },
  },
  [normalizeText("Let's learn wipe table.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_teach_wipe_table_b6d5b1ff.wav",
      text: "Let's learn wipe table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_teach_wipe_table_b6d5b1ff.wav",
      text: "Let's learn wipe table.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_teach_wipe_table_b6d5b1ff.wav",
      text: "Let's learn wipe table.",
    },
  },
  [normalizeText("Let's learn write your name.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_write_name_0bad8033.wav",
      text: "Let's learn write your name.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_write_name_0bad8033.wav",
      text: "Let's learn write your name.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_write_name_0bad8033.wav",
      text: "Let's learn write your name.",
    },
  },
  [normalizeText("Let’s review together.")]: {
    "en-US": {
      key: "shared/audio/en-US/neural2-c-r1/review_game_intro_33982bd2.wav",
      text: "Let’s review together.",
    },
    "en-GB": {
      key: "shared/audio/en-GB/neural2-c-r1/review_game_intro_33982bd2.wav",
      text: "Let’s review together.",
    },
    legacy: {
      key: "shared/audio/en/review_game_intro_33982bd2.wav",
      text: "Let’s review together.",
    },
  },
  [normalizeText("line up")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/line_up.wav",
      text: "line up",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/line_up.wav",
      text: "line up",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/line_up.wav",
      text: "line up",
    },
  },
  [normalizeText("Line up.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_drag_bag_to_line_1bea79b0.wav",
      text: "Line up.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_drag_bag_to_line_1bea79b0.wav",
      text: "Line up.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_drag_bag_to_line_1bea79b0.wav",
      text: "Line up.",
    },
  },
  [normalizeText("listen")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/listen.wav",
      text: "listen",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/listen.wav",
      text: "listen",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/listen.wav",
      text: "listen",
    },
  },
  [normalizeText("Listen.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_tap_teacher_listen_d4d11a3b.wav",
      text: "Listen.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_tap_teacher_listen_d4d11a3b.wav",
      text: "Listen.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_tap_teacher_listen_d4d11a3b.wav",
      text: "Listen.",
    },
  },
  [normalizeText("load dishwasher")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/load_dishwasher.wav",
      text: "load dishwasher",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/load_dishwasher.wav",
      text: "load dishwasher",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/load_dishwasher.wav",
      text: "load dishwasher",
    },
  },
  [normalizeText("Load dishwasher.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_drag_dish_to_dishwasher_d8565f14.wav",
      text: "Load dishwasher.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_dish_to_dishwasher_d8565f14.wav",
      text: "Load dishwasher.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_drag_dish_to_dishwasher_d8565f14.wav",
      text: "Load dishwasher.",
    },
  },
  [normalizeText("lullaby")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/lullaby.wav",
      text: "lullaby",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/lullaby.wav",
      text: "lullaby",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/lullaby.wav",
      text: "lullaby",
    },
  },
  [normalizeText("Lunch Box is complete.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/completion_9ec67cb5.wav",
      text: "Lunch Box is complete.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/completion_9ec67cb5.wav",
      text: "Lunch Box is complete.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/completion_9ec67cb5.wav",
      text: "Lunch Box is complete.",
    },
  },
  [normalizeText("Lunch time!")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_intro_3faf0a16.wav",
      text: "Lunch time!",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_intro_3faf0a16.wav",
      text: "Lunch time!",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_intro_3faf0a16.wav",
      text: "Lunch time!",
    },
  },
  [normalizeText("Lunch with Friends is complete.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/completion_4e45d3ea.wav",
      text: "Lunch with Friends is complete.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/completion_4e45d3ea.wav",
      text: "Lunch with Friends is complete.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/completion_4e45d3ea.wav",
      text: "Lunch with Friends is complete.",
    },
  },
  [normalizeText("Lunch with friends!")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_intro_ad46c94c.wav",
      text: "Lunch with friends!",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_intro_ad46c94c.wav",
      text: "Lunch with friends!",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_intro_ad46c94c.wav",
      text: "Lunch with friends!",
    },
  },
  [normalizeText("lunchbox")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/lunchbox.wav",
      text: "lunchbox",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/lunchbox.wav",
      text: "lunchbox",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/lunchbox.wav",
      text: "lunchbox",
    },
  },
  [normalizeText("make bubbles")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/make_bubbles.wav",
      text: "make bubbles",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/make_bubbles.wav",
      text: "make bubbles",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/make_bubbles.wav",
      text: "make bubbles",
    },
  },
  [normalizeText("Make bubbles.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_drag_foam_to_bubbles_e8c187bf.wav",
      text: "Make bubbles.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_drag_foam_to_bubbles_e8c187bf.wav",
      text: "Make bubbles.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_drag_foam_to_bubbles_e8c187bf.wav",
      text: "Make bubbles.",
    },
  },
  [normalizeText("make the bed")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/make_the_bed.wav",
      text: "make the bed",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/make_the_bed.wav",
      text: "make the bed",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/make_the_bed.wav",
      text: "make the bed",
    },
  },
  [normalizeText("Make the bed.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_drag_blanket_to_box_90e6f54e.wav",
      text: "Make the bed.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_drag_blanket_to_box_90e6f54e.wav",
      text: "Make the bed.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_drag_blanket_to_box_90e6f54e.wav",
      text: "Make the bed.",
    },
  },
  [normalizeText("milk")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/milk.wav",
      text: "milk",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/milk.wav",
      text: "milk",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/milk.wav",
      text: "milk",
    },
  },
  [normalizeText("mirror")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/mirror.wav",
      text: "mirror",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/mirror.wav",
      text: "mirror",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/mirror.wav",
      text: "mirror",
    },
  },
  [normalizeText("moon mobile")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/moon_mobile.wav",
      text: "moon mobile",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/moon_mobile.wav",
      text: "moon mobile",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/moon_mobile.wav",
      text: "moon mobile",
    },
  },
  [normalizeText("move cart")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/move_cart.wav",
      text: "move cart",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/move_cart.wav",
      text: "move cart",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/move_cart.wav",
      text: "move cart",
    },
  },
  [normalizeText("Move cart.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_drag_move_cart_623a7c69.wav",
      text: "Move cart.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_drag_move_cart_623a7c69.wav",
      text: "Move cart.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_drag_move_cart_623a7c69.wav",
      text: "Move cart.",
    },
  },
  [normalizeText("music")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/music.wav",
      text: "music",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/music.wav",
      text: "music",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/music.wav",
      text: "music",
    },
  },
  [normalizeText("napkin")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/napkin.wav",
      text: "napkin",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/napkin.wav",
      text: "napkin",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/napkin.wav",
      text: "napkin",
    },
  },
  [normalizeText("night light")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/night_light.wav",
      text: "night light",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/night_light.wav",
      text: "night light",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/night_light.wav",
      text: "night light",
    },
  },
  [normalizeText("nightstand")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/nightstand.wav",
      text: "nightstand",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/nightstand.wav",
      text: "nightstand",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/nightstand.wav",
      text: "nightstand",
    },
  },
  [normalizeText("noodles")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/noodles.wav",
      text: "noodles",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/noodles.wav",
      text: "noodles",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/noodles.wav",
      text: "noodles",
    },
  },
  [normalizeText("notebook")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/notebook.wav",
      text: "notebook",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/notebook.wav",
      text: "notebook",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/notebook.wav",
      text: "notebook",
    },
  },
  [normalizeText("open book")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/open_book.wav",
      text: "open book",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/open_book.wav",
      text: "open book",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/open_book.wav",
      text: "open book",
    },
  },
  [normalizeText("Open book.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_tap_book_open_d5c33ad0.wav",
      text: "Open book.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_tap_book_open_d5c33ad0.wav",
      text: "Open book.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_tap_book_open_d5c33ad0.wav",
      text: "Open book.",
    },
  },
  [normalizeText("open lunchbox")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/open_lunchbox.wav",
      text: "open lunchbox",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/open_lunchbox.wav",
      text: "open lunchbox",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/open_lunchbox.wav",
      text: "open lunchbox",
    },
  },
  [normalizeText("Open lunchbox.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_tap_open_lunchbox_94ac9231.wav",
      text: "Open lunchbox.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_tap_open_lunchbox_94ac9231.wav",
      text: "Open lunchbox.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_tap_open_lunchbox_94ac9231.wav",
      text: "Open lunchbox.",
    },
  },
  [normalizeText("open snack box")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/open_snack_box.wav",
      text: "open snack box",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/open_snack_box.wav",
      text: "open snack box",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/open_snack_box.wav",
      text: "open snack box",
    },
  },
  [normalizeText("Open snack box.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_tap_box_open_886f0ac6.wav",
      text: "Open snack box.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_tap_box_open_886f0ac6.wav",
      text: "Open snack box.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_tap_box_open_886f0ac6.wav",
      text: "Open snack box.",
    },
  },
  [normalizeText("pack bag")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/pack_bag.wav",
      text: "pack bag",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/pack_bag.wav",
      text: "pack bag",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/pack_bag.wav",
      text: "pack bag",
    },
  },
  [normalizeText("Pack bag.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_drag_folder_to_bag_45cc0d56.wav",
      text: "Pack bag.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_drag_folder_to_bag_45cc0d56.wav",
      text: "Pack bag.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_drag_folder_to_bag_45cc0d56.wav",
      text: "Pack bag.",
    },
  },
  [normalizeText("page tab")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/page_tab.wav",
      text: "page tab",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/page_tab.wav",
      text: "page tab",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/page_tab.wav",
      text: "page tab",
    },
  },
  [normalizeText("pajamas")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/pajamas.wav",
      text: "pajamas",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/pajamas.wav",
      text: "pajamas",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/pajamas.wav",
      text: "pajamas",
    },
  },
  [normalizeText("paper")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/paper.wav",
      text: "paper",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/paper.wav",
      text: "paper",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/paper.wav",
      text: "paper",
    },
  },
  [normalizeText("pass dish")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/pass_dish.wav",
      text: "pass dish",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/pass_dish.wav",
      text: "pass dish",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/pass_dish.wav",
      text: "pass dish",
    },
  },
  [normalizeText("Pass dish.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_drag_dish_to_grownup_317e0f67.wav",
      text: "Pass dish.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_drag_dish_to_grownup_317e0f67.wav",
      text: "Pass dish.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_drag_dish_to_grownup_317e0f67.wav",
      text: "Pass dish.",
    },
  },
  [normalizeText("pencil")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/pencil.wav",
      text: "pencil",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/pencil.wav",
      text: "pencil",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/pencil.wav",
      text: "pencil",
    },
  },
  [normalizeText("pillow")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/pillow.wav",
      text: "pillow",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/pillow.wav",
      text: "pillow",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/pillow.wav",
      text: "pillow",
    },
  },
  [normalizeText("place bookmark")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/place_bookmark.wav",
      text: "place bookmark",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/place_bookmark.wav",
      text: "place bookmark",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/place_bookmark.wav",
      text: "place bookmark",
    },
  },
  [normalizeText("placemat")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/placemat.wav",
      text: "placemat",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/placemat.wav",
      text: "placemat",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/placemat.wav",
      text: "placemat",
    },
  },
  [normalizeText("plate")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/plate.wav",
      text: "plate",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/plate.wav",
      text: "plate",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/plate.wav",
      text: "plate",
    },
  },
  [normalizeText("Play at home!")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_intro_4c4160af.wav",
      text: "Play at home!",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_intro_4c4160af.wav",
      text: "Play at home!",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_intro_4c4160af.wav",
      text: "Play at home!",
    },
  },
  [normalizeText("play gently")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/play_gently.wav",
      text: "play gently",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/play_gently.wav",
      text: "play gently",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/play_gently.wav",
      text: "play gently",
    },
  },
  [normalizeText("Play gently.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_tap_doll_gently_8f927d20.wav",
      text: "Play gently.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_tap_doll_gently_8f927d20.wav",
      text: "Play gently.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_tap_doll_gently_8f927d20.wav",
      text: "Play gently.",
    },
  },
  [normalizeText("play lullaby")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/play_lullaby.wav",
      text: "play lullaby",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/play_lullaby.wav",
      text: "play lullaby",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/play_lullaby.wav",
      text: "play lullaby",
    },
  },
  [normalizeText("Play lullaby.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_tap_play_lullaby_963a01d7.wav",
      text: "Play lullaby.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_tap_play_lullaby_963a01d7.wav",
      text: "Play lullaby.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_tap_play_lullaby_963a01d7.wav",
      text: "Play lullaby.",
    },
  },
  [normalizeText("play together")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/play_together.wav",
      text: "play together",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/play_together.wav",
      text: "play together",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/play_together.wav",
      text: "play together",
    },
  },
  [normalizeText("Play together!")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_intro_14d2582f.wav",
      text: "Play together!",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_intro_14d2582f.wav",
      text: "Play together!",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_intro_14d2582f.wav",
      text: "Play together!",
    },
  },
  [normalizeText("Play together.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_drag_blocks_play_together_000fe634.wav",
      text: "Play together.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_drag_blocks_play_together_000fe634.wav",
      text: "Play together.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_drag_blocks_play_together_000fe634.wav",
      text: "Play together.",
    },
  },
  [normalizeText("playground")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/playground.wav",
      text: "playground",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/playground.wav",
      text: "playground",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/playground.wav",
      text: "playground",
    },
  },
  [normalizeText("Playground is complete.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/completion_caa6cf2b.wav",
      text: "Playground is complete.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/completion_caa6cf2b.wav",
      text: "Playground is complete.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/completion_caa6cf2b.wav",
      text: "Playground is complete.",
    },
  },
  [normalizeText("Playtime!")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_intro_795e2654.wav",
      text: "Playtime!",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_intro_795e2654.wav",
      text: "Playtime!",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_intro_795e2654.wav",
      text: "Playtime!",
    },
  },
  [normalizeText("pot holder")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/pot_holder.wav",
      text: "pot holder",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/pot_holder.wav",
      text: "pot holder",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/pot_holder.wav",
      text: "pot holder",
    },
  },
  [normalizeText("pour juice")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/pour_juice.wav",
      text: "pour juice",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/pour_juice.wav",
      text: "pour juice",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/pour_juice.wav",
      text: "pour juice",
    },
  },
  [normalizeText("Pour juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_drag_juice_to_container_2d076800.wav",
      text: "Pour juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_drag_juice_to_container_2d076800.wav",
      text: "Pour juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_drag_juice_to_container_2d076800.wav",
      text: "Pour juice.",
    },
  },
  [normalizeText("pour milk")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/pour_milk.wav",
      text: "pour milk",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/pour_milk.wav",
      text: "pour milk",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/pour_milk.wav",
      text: "pour milk",
    },
  },
  [normalizeText("Pour milk.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_drag_milk_to_cup_88ef906b.wav",
      text: "Pour milk.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_drag_milk_to_cup_88ef906b.wav",
      text: "Pour milk.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_drag_milk_to_cup_88ef906b.wav",
      text: "Pour milk.",
    },
  },
  [normalizeText("put away book")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/put_away_book.wav",
      text: "put away book",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/put_away_book.wav",
      text: "put away book",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/put_away_book.wav",
      text: "put away book",
    },
  },
  [normalizeText("Put away book.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_drag_book_away_05dc2a65.wav",
      text: "Put away book.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_book_away_05dc2a65.wav",
      text: "Put away book.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_drag_book_away_05dc2a65.wav",
      text: "Put away book.",
    },
  },
  [normalizeText("put away tray")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/put_away_tray.wav",
      text: "put away tray",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/put_away_tray.wav",
      text: "put away tray",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/put_away_tray.wav",
      text: "put away tray",
    },
  },
  [normalizeText("Put away tray.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_drag_tray_away_a34fb917.wav",
      text: "Put away tray.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_tray_away_a34fb917.wav",
      text: "Put away tray.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_drag_tray_away_a34fb917.wav",
      text: "Put away tray.",
    },
  },
  [normalizeText("put on pajamas")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/put_on_pajamas.wav",
      text: "put on pajamas",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/put_on_pajamas.wav",
      text: "put on pajamas",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/put_on_pajamas.wav",
      text: "put on pajamas",
    },
  },
  [normalizeText("Put on pajamas.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_drag_pajamas_to_baby_8c85e833.wav",
      text: "Put on pajamas.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_drag_pajamas_to_baby_8c85e833.wav",
      text: "Put on pajamas.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_drag_pajamas_to_baby_8c85e833.wav",
      text: "Put on pajamas.",
    },
  },
  [normalizeText("put on shoes")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/put_on_shoes.wav",
      text: "put on shoes",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/put_on_shoes.wav",
      text: "put on shoes",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/put_on_shoes.wav",
      text: "put on shoes",
    },
  },
  [normalizeText("Put on shoes.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_drag_shoes_to_feet_ffbbb4cb.wav",
      text: "Put on shoes.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_drag_shoes_to_feet_ffbbb4cb.wav",
      text: "Put on shoes.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_drag_shoes_to_feet_ffbbb4cb.wav",
      text: "Put on shoes.",
    },
  },
  [normalizeText("Put the apple on the plate.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_drag_apple_to_plate_3f3cf028.wav",
      text: "Put the apple on the plate.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_drag_apple_to_plate_3f3cf028.wav",
      text: "Put the apple on the plate.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_drag_apple_to_plate_3f3cf028.wav",
      text: "Put the apple on the plate.",
    },
  },
  [normalizeText("Put the banana on the plate.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_drag_banana_to_plate_0b53dc90.wav",
      text: "Put the banana on the plate.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_drag_banana_to_plate_0b53dc90.wav",
      text: "Put the banana on the plate.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_drag_banana_to_plate_0b53dc90.wav",
      text: "Put the banana on the plate.",
    },
  },
  [normalizeText("Put the book in the bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_drag_book_to_bag_b8415e61.wav",
      text: "Put the book in the bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_drag_book_to_bag_b8415e61.wav",
      text: "Put the book in the bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_drag_book_to_bag_b8415e61.wav",
      text: "Put the book in the bag.",
    },
  },
  [normalizeText("Put the lunchbox in the bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_drag_lunchbox_to_bag_1d74fa06.wav",
      text: "Put the lunchbox in the bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_drag_lunchbox_to_bag_1d74fa06.wav",
      text: "Put the lunchbox in the bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_drag_lunchbox_to_bag_1d74fa06.wav",
      text: "Put the lunchbox in the bag.",
    },
  },
  [normalizeText("Put the pillow in the box.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_drag_pillow_to_box_a658ae37.wav",
      text: "Put the pillow in the box.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_drag_pillow_to_box_a658ae37.wav",
      text: "Put the pillow in the box.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_drag_pillow_to_box_a658ae37.wav",
      text: "Put the pillow in the box.",
    },
  },
  [normalizeText("Put the socks in the box.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_drag_socks_to_box_bcde2bbf.wav",
      text: "Put the socks in the box.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_drag_socks_to_box_bcde2bbf.wav",
      text: "Put the socks in the box.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_drag_socks_to_box_bcde2bbf.wav",
      text: "Put the socks in the box.",
    },
  },
  [normalizeText("Put the toothpaste on the toothbrush.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_drag_toothpaste_to_brush_e3080830.wav",
      text: "Put the toothpaste on the toothbrush.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_drag_toothpaste_to_brush_e3080830.wav",
      text: "Put the toothpaste on the toothbrush.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_drag_toothpaste_to_brush_e3080830.wav",
      text: "Put the toothpaste on the toothbrush.",
    },
  },
  [normalizeText("puzzle")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/puzzle.wav",
      text: "puzzle",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/puzzle.wav",
      text: "puzzle",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/puzzle.wav",
      text: "puzzle",
    },
  },
  [normalizeText("raise hand")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/raise_hand.wav",
      text: "raise hand",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/raise_hand.wav",
      text: "raise hand",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/raise_hand.wav",
      text: "raise hand",
    },
  },
  [normalizeText("Raise hand.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_tap_hand_27f8c858.wav",
      text: "Raise hand.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_tap_hand_27f8c858.wav",
      text: "Raise hand.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_tap_hand_27f8c858.wav",
      text: "Raise hand.",
    },
  },
  [normalizeText("raisins")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/raisins.wav",
      text: "raisins",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/raisins.wav",
      text: "raisins",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/raisins.wav",
      text: "raisins",
    },
  },
  [normalizeText("read book")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/read_book.wav",
      text: "read book",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/read_book.wav",
      text: "read book",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/read_book.wav",
      text: "read book",
    },
  },
  [normalizeText("Read book.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_tap_book_read_bb53d60a.wav",
      text: "Read book.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_tap_book_read_bb53d60a.wav",
      text: "Read book.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_tap_book_read_bb53d60a.wav",
      text: "Read book.",
    },
  },
  [normalizeText("read softly")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/read_softly.wav",
      text: "read softly",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/read_softly.wav",
      text: "read softly",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/read_softly.wav",
      text: "read softly",
    },
  },
  [normalizeText("Read softly.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_tap_read_softly_a8c37fcc.wav",
      text: "Read softly.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_tap_read_softly_a8c37fcc.wav",
      text: "Read softly.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_tap_read_softly_a8c37fcc.wav",
      text: "Read softly.",
    },
  },
  [normalizeText("reading nook")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/reading_nook.wav",
      text: "reading nook",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/reading_nook.wav",
      text: "reading nook",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/reading_nook.wav",
      text: "reading nook",
    },
  },
  [normalizeText("Ready to sleep!")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_intro_0793e8e2.wav",
      text: "Ready to sleep!",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_intro_0793e8e2.wav",
      text: "Ready to sleep!",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_intro_0793e8e2.wav",
      text: "Ready to sleep!",
    },
  },
  [normalizeText("recycling bin")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/recycling_bin.wav",
      text: "recycling bin",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/recycling_bin.wav",
      text: "recycling bin",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/recycling_bin.wav",
      text: "recycling bin",
    },
  },
  [normalizeText("rest")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/rest.wav",
      text: "rest",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/rest.wav",
      text: "rest",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/rest.wav",
      text: "rest",
    },
  },
  [normalizeText("Rest After Play is complete.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/completion_89f71a39.wav",
      text: "Rest After Play is complete.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/completion_89f71a39.wav",
      text: "Rest After Play is complete.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/completion_89f71a39.wav",
      text: "Rest After Play is complete.",
    },
  },
  [normalizeText("rice")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/rice.wav",
      text: "rice",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/rice.wav",
      text: "rice",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/rice.wav",
      text: "rice",
    },
  },
  [normalizeText("Ride home!")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_intro_658e4d53.wav",
      text: "Ride home!",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_intro_658e4d53.wav",
      text: "Ride home!",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_intro_658e4d53.wav",
      text: "Ride home!",
    },
  },
  [normalizeText("rinse hair")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/rinse_hair.wav",
      text: "rinse hair",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/rinse_hair.wav",
      text: "rinse hair",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/rinse_hair.wav",
      text: "rinse hair",
    },
  },
  [normalizeText("Rinse hair.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_drag_shower_head_to_hair_33944850.wav",
      text: "Rinse hair.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_drag_shower_head_to_hair_33944850.wav",
      text: "Rinse hair.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_drag_shower_head_to_hair_33944850.wav",
      text: "Rinse hair.",
    },
  },
  [normalizeText("road")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/road.wav",
      text: "road",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/road.wav",
      text: "road",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/road.wav",
      text: "road",
    },
  },
  [normalizeText("robe")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/robe.wav",
      text: "robe",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/robe.wav",
      text: "robe",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/robe.wav",
      text: "robe",
    },
  },
  [normalizeText("rope")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/rope.wav",
      text: "rope",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/rope.wav",
      text: "rope",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/rope.wav",
      text: "rope",
    },
  },
  [normalizeText("rubber gloves")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/rubber_gloves.wav",
      text: "rubber gloves",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/rubber_gloves.wav",
      text: "rubber gloves",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/rubber_gloves.wav",
      text: "rubber gloves",
    },
  },
  [normalizeText("ruler")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/ruler.wav",
      text: "ruler",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/ruler.wav",
      text: "ruler",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/ruler.wav",
      text: "ruler",
    },
  },
  [normalizeText("run")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/run.wav",
      text: "run",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/run.wav",
      text: "run",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/run.wav",
      text: "run",
    },
  },
  [normalizeText("salad")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/salad.wav",
      text: "salad",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/salad.wav",
      text: "salad",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/salad.wav",
      text: "salad",
    },
  },
  [normalizeText("sandbox")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/sandbox.wav",
      text: "sandbox",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/sandbox.wav",
      text: "sandbox",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/sandbox.wav",
      text: "sandbox",
    },
  },
  [normalizeText("sauce")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/sauce.wav",
      text: "sauce",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/sauce.wav",
      text: "sauce",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/sauce.wav",
      text: "sauce",
    },
  },
  [normalizeText("save leftovers")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/save_leftovers.wav",
      text: "save leftovers",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/save_leftovers.wav",
      text: "save leftovers",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/save_leftovers.wav",
      text: "save leftovers",
    },
  },
  [normalizeText("Save leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_drag_save_leftovers_7dee36d6.wav",
      text: "Save leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_save_leftovers_7dee36d6.wav",
      text: "Save leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_drag_save_leftovers_7dee36d6.wav",
      text: "Save leftovers.",
    },
  },
  [normalizeText("say good night")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/say_good_night.wav",
      text: "say good night",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/say_good_night.wav",
      text: "say good night",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/say_good_night.wav",
      text: "say good night",
    },
  },
  [normalizeText("Say good night.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_tap_good_night_fa63c7e5.wav",
      text: "Say good night.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_good_night_fa63c7e5.wav",
      text: "Say good night.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_tap_good_night_fa63c7e5.wav",
      text: "Say good night.",
    },
  },
  [normalizeText("say goodbye")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/say_goodbye.wav",
      text: "say goodbye",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/say_goodbye.wav",
      text: "say goodbye",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/say_goodbye.wav",
      text: "say goodbye",
    },
  },
  [normalizeText("Say goodbye.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_tap_goodbye_card_667b429c.wav",
      text: "Say goodbye.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_tap_goodbye_card_667b429c.wav",
      text: "Say goodbye.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_tap_goodbye_card_667b429c.wav",
      text: "Say goodbye.",
    },
  },
  [normalizeText("Say it with me.")]: {
    "en-US": {
      key: "shared/audio/en-US/neural2-c-r1/speak_prompt_1f8ffb29.wav",
      text: "Say it with me.",
    },
    "en-GB": {
      key: "shared/audio/en-GB/neural2-c-r1/speak_prompt_1f8ffb29.wav",
      text: "Say it with me.",
    },
    legacy: {
      key: "shared/audio/en/speak_prompt_1f8ffb29.wav",
      text: "Say it with me.",
    },
  },
  [normalizeText("say thank you")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/say_thank_you.wav",
      text: "say thank you",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/say_thank_you.wav",
      text: "say thank you",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/say_thank_you.wav",
      text: "say thank you",
    },
  },
  [normalizeText("Say thank you.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_tap_thanks_card_75371f36.wav",
      text: "Say thank you.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_tap_thanks_card_75371f36.wav",
      text: "Say thank you.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_tap_thanks_card_75371f36.wav",
      text: "Say thank you.",
    },
  },
  [normalizeText("school")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/school.wav",
      text: "school",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/school.wav",
      text: "school",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/school.wav",
      text: "school",
    },
  },
  [normalizeText("School Supplies is complete.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/completion_cbdabe84.wav",
      text: "School Supplies is complete.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/completion_cbdabe84.wav",
      text: "School Supplies is complete.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/completion_cbdabe84.wav",
      text: "School Supplies is complete.",
    },
  },
  [normalizeText("School supplies!")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_intro_adf2290b.wav",
      text: "School supplies!",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_intro_adf2290b.wav",
      text: "School supplies!",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_intro_adf2290b.wav",
      text: "School supplies!",
    },
  },
  [normalizeText("scraper")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/scraper.wav",
      text: "scraper",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/scraper.wav",
      text: "scraper",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/scraper.wav",
      text: "scraper",
    },
  },
  [normalizeText("scrub knees")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/scrub_knees.wav",
      text: "scrub knees",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/scrub_knees.wav",
      text: "scrub knees",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/scrub_knees.wav",
      text: "scrub knees",
    },
  },
  [normalizeText("Scrub knees.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_drag_sponge_to_knee_2933b912.wav",
      text: "Scrub knees.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_drag_sponge_to_knee_2933b912.wav",
      text: "Scrub knees.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_drag_sponge_to_knee_2933b912.wav",
      text: "Scrub knees.",
    },
  },
  [normalizeText("scrub spot")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/scrub_spot.wav",
      text: "scrub spot",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/scrub_spot.wav",
      text: "scrub spot",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/scrub_spot.wav",
      text: "scrub spot",
    },
  },
  [normalizeText("Scrub spot.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_drag_brush_scrub_spot_9b02811d.wav",
      text: "Scrub spot.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_drag_brush_scrub_spot_9b02811d.wav",
      text: "Scrub spot.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_drag_brush_scrub_spot_9b02811d.wav",
      text: "Scrub spot.",
    },
  },
  [normalizeText("seat belt")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/seat_belt.wav",
      text: "seat belt",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/seat_belt.wav",
      text: "seat belt",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/seat_belt.wav",
      text: "seat belt",
    },
  },
  [normalizeText("seesaw")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/seesaw.wav",
      text: "seesaw",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/seesaw.wav",
      text: "seesaw",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/seesaw.wav",
      text: "seesaw",
    },
  },
  [normalizeText("serve noodles")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/serve_noodles.wav",
      text: "serve noodles",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/serve_noodles.wav",
      text: "serve noodles",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/serve_noodles.wav",
      text: "serve noodles",
    },
  },
  [normalizeText("Serve noodles.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_drag_serve_noodles_818f5688.wav",
      text: "Serve noodles.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_drag_serve_noodles_818f5688.wav",
      text: "Serve noodles.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_drag_serve_noodles_818f5688.wav",
      text: "Serve noodles.",
    },
  },
  [normalizeText("serving cart")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/serving_cart.wav",
      text: "serving cart",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/serving_cart.wav",
      text: "serving cart",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/serving_cart.wav",
      text: "serving cart",
    },
  },
  [normalizeText("serving tray")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/serving_tray.wav",
      text: "serving tray",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/serving_tray.wav",
      text: "serving tray",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/serving_tray.wav",
      text: "serving tray",
    },
  },
  [normalizeText("set placemat")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/set_placemat.wav",
      text: "set placemat",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/set_placemat.wav",
      text: "set placemat",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/set_placemat.wav",
      text: "set placemat",
    },
  },
  [normalizeText("Set placemat.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_drag_set_placemat_a6bb1705.wav",
      text: "Set placemat.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_drag_set_placemat_a6bb1705.wav",
      text: "Set placemat.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_drag_set_placemat_a6bb1705.wav",
      text: "Set placemat.",
    },
  },
  [normalizeText("shade")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/shade.wav",
      text: "shade",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/shade.wav",
      text: "shade",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/shade.wav",
      text: "shade",
    },
  },
  [normalizeText("shampoo")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/shampoo.wav",
      text: "shampoo",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/shampoo.wav",
      text: "shampoo",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/shampoo.wav",
      text: "shampoo",
    },
  },
  [normalizeText("share food")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/share_food.wav",
      text: "share food",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/share_food.wav",
      text: "share food",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/share_food.wav",
      text: "share food",
    },
  },
  [normalizeText("Share food.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_drag_fruit_to_friend_a60142c1.wav",
      text: "Share food.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_drag_fruit_to_friend_a60142c1.wav",
      text: "Share food.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_drag_fruit_to_friend_a60142c1.wav",
      text: "Share food.",
    },
  },
  [normalizeText("share toys")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/share_toys.wav",
      text: "share toys",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/share_toys.wav",
      text: "share toys",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/share_toys.wav",
      text: "share toys",
    },
  },
  [normalizeText("Share toys.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_drag_toy_to_friend_8e771851.wav",
      text: "Share toys.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_drag_toy_to_friend_8e771851.wav",
      text: "Share toys.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_drag_toy_to_friend_8e771851.wav",
      text: "Share toys.",
    },
  },
  [normalizeText("Sharing Dinner Dishes is complete.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/completion_6d101470.wav",
      text: "Sharing Dinner Dishes is complete.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/completion_6d101470.wav",
      text: "Sharing Dinner Dishes is complete.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/completion_6d101470.wav",
      text: "Sharing Dinner Dishes is complete.",
    },
  },
  [normalizeText("shelf")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/shelf.wav",
      text: "shelf",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/shelf.wav",
      text: "shelf",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/shelf.wav",
      text: "shelf",
    },
  },
  [normalizeText("shoes")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/shoes.wav",
      text: "shoes",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/shoes.wav",
      text: "shoes",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/shoes.wav",
      text: "shoes",
    },
  },
  [normalizeText("shoulder")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/shoulder.wav",
      text: "shoulder",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/shoulder.wav",
      text: "shoulder",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/shoulder.wav",
      text: "shoulder",
    },
  },
  [normalizeText("shower")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/shower.wav",
      text: "shower",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/shower.wav",
      text: "shower",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/shower.wav",
      text: "shower",
    },
  },
  [normalizeText("shower head")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/shower_head.wav",
      text: "shower head",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/shower_head.wav",
      text: "shower head",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/shower_head.wav",
      text: "shower head",
    },
  },
  [normalizeText("sink")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/sink.wav",
      text: "sink",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/sink.wav",
      text: "sink",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/sink.wav",
      text: "sink",
    },
  },
  [normalizeText("sip")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/sip.wav",
      text: "sip",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/sip.wav",
      text: "sip",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/sip.wav",
      text: "sip",
    },
  },
  [normalizeText("sip juice")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/sip_juice.wav",
      text: "sip juice",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/sip_juice.wav",
      text: "sip juice",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/sip_juice.wav",
      text: "sip juice",
    },
  },
  [normalizeText("Sip juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_drag_sip_to_mouth_250bfe14.wav",
      text: "Sip juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_drag_sip_to_mouth_250bfe14.wav",
      text: "Sip juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_drag_sip_to_mouth_250bfe14.wav",
      text: "Sip juice.",
    },
  },
  [normalizeText("Sip.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_tap_sip_3283193f.wav",
      text: "Sip.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_tap_sip_3283193f.wav",
      text: "Sip.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_tap_sip_3283193f.wav",
      text: "Sip.",
    },
  },
  [normalizeText("sit at table")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/sit_at_table.wav",
      text: "sit at table",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/sit_at_table.wav",
      text: "sit at table",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/sit_at_table.wav",
      text: "sit at table",
    },
  },
  [normalizeText("Sit at table.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_drag_chair_to_seat_0487de92.wav",
      text: "Sit at table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_drag_chair_to_seat_0487de92.wav",
      text: "Sit at table.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_drag_chair_to_seat_0487de92.wav",
      text: "Sit at table.",
    },
  },
  [normalizeText("sit down")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/sit_down.wav",
      text: "sit down",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/sit_down.wav",
      text: "sit down",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/sit_down.wav",
      text: "sit down",
    },
  },
  [normalizeText("Sit down.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_tap_chair_sit_down_fc695df3.wav",
      text: "Sit down.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_tap_chair_sit_down_fc695df3.wav",
      text: "Sit down.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_tap_chair_sit_down_fc695df3.wav",
      text: "Sit down.",
    },
  },
  [normalizeText("sleep mask")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/sleep_mask.wav",
      text: "sleep mask",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/sleep_mask.wav",
      text: "sleep mask",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/sleep_mask.wav",
      text: "sleep mask",
    },
  },
  [normalizeText("slide")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/slide.wav",
      text: "slide",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/slide.wav",
      text: "slide",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/slide.wav",
      text: "slide",
    },
  },
  [normalizeText("slippers")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/slippers.wav",
      text: "slippers",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/slippers.wav",
      text: "slippers",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/slippers.wav",
      text: "slippers",
    },
  },
  [normalizeText("small table")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/small_table.wav",
      text: "small table",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/small_table.wav",
      text: "small table",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/small_table.wav",
      text: "small table",
    },
  },
  [normalizeText("snack")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/snack.wav",
      text: "snack",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/snack.wav",
      text: "snack",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/snack.wav",
      text: "snack",
    },
  },
  [normalizeText("snack box")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/snack_box.wav",
      text: "snack box",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/snack_box.wav",
      text: "snack box",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/snack_box.wav",
      text: "snack box",
    },
  },
  [normalizeText("Snack time!")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_intro_ab6159cf.wav",
      text: "Snack time!",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_intro_ab6159cf.wav",
      text: "Snack time!",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_intro_ab6159cf.wav",
      text: "Snack time!",
    },
  },
  [normalizeText("soap")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/soap.wav",
      text: "soap",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/soap.wav",
      text: "soap",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/soap.wav",
      text: "soap",
    },
  },
  [normalizeText("socks")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/socks.wav",
      text: "socks",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/socks.wav",
      text: "socks",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/socks.wav",
      text: "socks",
    },
  },
  [normalizeText("soft voice")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/soft_voice.wav",
      text: "soft voice",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/soft_voice.wav",
      text: "soft voice",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/soft_voice.wav",
      text: "soft voice",
    },
  },
  [normalizeText("solve puzzle")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/solve_puzzle.wav",
      text: "solve puzzle",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/solve_puzzle.wav",
      text: "solve puzzle",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/solve_puzzle.wav",
      text: "solve puzzle",
    },
  },
  [normalizeText("Solve puzzle.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_drag_puzzle_piece_0ea7d169.wav",
      text: "Solve puzzle.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_drag_puzzle_piece_0ea7d169.wav",
      text: "Solve puzzle.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_drag_puzzle_piece_0ea7d169.wav",
      text: "Solve puzzle.",
    },
  },
  [normalizeText("Sort and dry!")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_intro_41ca81ab.wav",
      text: "Sort and dry!",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_intro_41ca81ab.wav",
      text: "Sort and dry!",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_intro_41ca81ab.wav",
      text: "Sort and dry!",
    },
  },
  [normalizeText("sort recycling")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/sort_recycling.wav",
      text: "sort recycling",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/sort_recycling.wav",
      text: "sort recycling",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/sort_recycling.wav",
      text: "sort recycling",
    },
  },
  [normalizeText("Sort recycling.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_drag_carton_to_recycling_ebb06909.wav",
      text: "Sort recycling.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_drag_carton_to_recycling_ebb06909.wav",
      text: "Sort recycling.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_drag_carton_to_recycling_ebb06909.wav",
      text: "Sort recycling.",
    },
  },
  [normalizeText("Sorting and Drying is complete.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/completion_a2369f46.wav",
      text: "Sorting and Drying is complete.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/completion_a2369f46.wav",
      text: "Sorting and Drying is complete.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/completion_a2369f46.wav",
      text: "Sorting and Drying is complete.",
    },
  },
  [normalizeText("sound machine")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/sound_machine.wav",
      text: "sound machine",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/sound_machine.wav",
      text: "sound machine",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/sound_machine.wav",
      text: "sound machine",
    },
  },
  [normalizeText("soup")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/soup.wav",
      text: "soup",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/soup.wav",
      text: "soup",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/soup.wav",
      text: "soup",
    },
  },
  [normalizeText("spill")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/spill.wav",
      text: "spill",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/spill.wav",
      text: "spill",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/spill.wav",
      text: "spill",
    },
  },
  [normalizeText("spoon")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/spoon.wav",
      text: "spoon",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/spoon.wav",
      text: "spoon",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/spoon.wav",
      text: "spoon",
    },
  },
  [normalizeText("spray bottle")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/spray_bottle.wav",
      text: "spray bottle",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/spray_bottle.wav",
      text: "spray bottle",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/spray_bottle.wav",
      text: "spray bottle",
    },
  },
  [normalizeText("Spray bottle.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_tap_spray_bottle_12c0e1f7.wav",
      text: "Spray bottle.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_tap_spray_bottle_12c0e1f7.wav",
      text: "Spray bottle.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_tap_spray_bottle_12c0e1f7.wav",
      text: "Spray bottle.",
    },
  },
  [normalizeText("spray stain")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/spray_stain.wav",
      text: "spray stain",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/spray_stain.wav",
      text: "spray stain",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/spray_stain.wav",
      text: "spray stain",
    },
  },
  [normalizeText("Spray stain.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_drag_spray_to_stain_ebc70b79.wav",
      text: "Spray stain.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_drag_spray_to_stain_ebc70b79.wav",
      text: "Spray stain.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_drag_spray_to_stain_ebc70b79.wav",
      text: "Spray stain.",
    },
  },
  [normalizeText("stack coasters")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/stack_coasters.wav",
      text: "stack coasters",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/stack_coasters.wav",
      text: "stack coasters",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/stack_coasters.wav",
      text: "stack coasters",
    },
  },
  [normalizeText("Stack coasters.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_drag_stack_coasters_bd0fc0a3.wav",
      text: "Stack coasters.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_drag_stack_coasters_bd0fc0a3.wav",
      text: "Stack coasters.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_drag_stack_coasters_bd0fc0a3.wav",
      text: "Stack coasters.",
    },
  },
  [normalizeText("stain")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/stain.wav",
      text: "stain",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/stain.wav",
      text: "stain",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/stain.wav",
      text: "stain",
    },
  },
  [normalizeText("star projector")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/star_projector.wav",
      text: "star projector",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/star_projector.wav",
      text: "star projector",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/star_projector.wav",
      text: "star projector",
    },
  },
  [normalizeText("start timer")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/start_timer.wav",
      text: "start timer",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/start_timer.wav",
      text: "start timer",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/start_timer.wav",
      text: "start timer",
    },
  },
  [normalizeText("Start timer.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_tap_start_timer_aa9d8fb8.wav",
      text: "Start timer.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_tap_start_timer_aa9d8fb8.wav",
      text: "Start timer.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_tap_start_timer_aa9d8fb8.wav",
      text: "Start timer.",
    },
  },
  [normalizeText("step onto mat")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/step_onto_mat.wav",
      text: "step onto mat",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/step_onto_mat.wav",
      text: "step onto mat",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/step_onto_mat.wav",
      text: "step onto mat",
    },
  },
  [normalizeText("Step onto mat.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_step_onto_mat_c7e5e9a6.wav",
      text: "Step onto mat.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_step_onto_mat_c7e5e9a6.wav",
      text: "Step onto mat.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_step_onto_mat_c7e5e9a6.wav",
      text: "Step onto mat.",
    },
  },
  [normalizeText("story shelf")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/story_shelf.wav",
      text: "story shelf",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/story_shelf.wav",
      text: "story shelf",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/story_shelf.wav",
      text: "story shelf",
    },
  },
  [normalizeText("storybook")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/storybook.wav",
      text: "storybook",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/storybook.wav",
      text: "storybook",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/storybook.wav",
      text: "storybook",
    },
  },
  [normalizeText("straw")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/straw.wav",
      text: "straw",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/straw.wav",
      text: "straw",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/straw.wav",
      text: "straw",
    },
  },
  [normalizeText("sun")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/sun.wav",
      text: "sun",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/sun.wav",
      text: "sun",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/sun.wav",
      text: "sun",
    },
  },
  [normalizeText("swing")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/swing.wav",
      text: "swing",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/swing.wav",
      text: "swing",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/swing.wav",
      text: "swing",
    },
  },
  [normalizeText("table")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/table.wav",
      text: "table",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/table.wav",
      text: "table",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/table.wav",
      text: "table",
    },
  },
  [normalizeText("take a bite")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/take_a_bite.wav",
      text: "take a bite",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/take_a_bite.wav",
      text: "take a bite",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/take_a_bite.wav",
      text: "take a bite",
    },
  },
  [normalizeText("Take a bite.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_drag_cracker_to_mouth_5473956c.wav",
      text: "Take a bite.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_drag_cracker_to_mouth_5473956c.wav",
      text: "Take a bite.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_drag_cracker_to_mouth_5473956c.wav",
      text: "Take a bite.",
    },
  },
  [normalizeText("Take a break!")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_intro_216c4a3e.wav",
      text: "Take a break!",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_intro_216c4a3e.wav",
      text: "Take a break!",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_intro_216c4a3e.wav",
      text: "Take a break!",
    },
  },
  [normalizeText("take off shoes")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/take_off_shoes.wav",
      text: "take off shoes",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/take_off_shoes.wav",
      text: "take off shoes",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/take_off_shoes.wav",
      text: "take off shoes",
    },
  },
  [normalizeText("Take off shoes.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_drag_shoes_to_shelf_8f5e2b36.wav",
      text: "Take off shoes.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_drag_shoes_to_shelf_8f5e2b36.wav",
      text: "Take off shoes.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_drag_shoes_to_shelf_8f5e2b36.wav",
      text: "Take off shoes.",
    },
  },
  [normalizeText("take turns")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/take_turns.wav",
      text: "take turns",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/take_turns.wav",
      text: "take turns",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/take_turns.wav",
      text: "take turns",
    },
  },
  [normalizeText("Take turns.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_drag_ball_to_turn_6fcb40a5.wav",
      text: "Take turns.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_drag_ball_to_turn_6fcb40a5.wav",
      text: "Take turns.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_drag_ball_to_turn_6fcb40a5.wav",
      text: "Take turns.",
    },
  },
  [normalizeText("Tap the apron.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_tap_apron_9b1de408.wav",
      text: "Tap the apron.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_tap_apron_9b1de408.wav",
      text: "Tap the apron.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_tap_apron_9b1de408.wav",
      text: "Tap the apron.",
    },
  },
  [normalizeText("Tap the bag.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_tap_bag_06a4af04.wav",
      text: "Tap the bag.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_tap_bag_06a4af04.wav",
      text: "Tap the bag.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_tap_bag_06a4af04.wav",
      text: "Tap the bag.",
    },
  },
  [normalizeText("Tap the basket.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_tap_basket_1c96a0df.wav",
      text: "Tap the basket.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_basket_1c96a0df.wav",
      text: "Tap the basket.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_tap_basket_1c96a0df.wav",
      text: "Tap the basket.",
    },
  },
  [normalizeText("Tap the bath sponge.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_bath_sponge_ddef35bc.wav",
      text: "Tap the bath sponge.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_bath_sponge_ddef35bc.wav",
      text: "Tap the bath sponge.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_bath_sponge_ddef35bc.wav",
      text: "Tap the bath sponge.",
    },
  },
  [normalizeText("Tap the bathtub.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_bathtub_d678ef2e.wav",
      text: "Tap the bathtub.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_bathtub_d678ef2e.wav",
      text: "Tap the bathtub.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_bathtub_d678ef2e.wav",
      text: "Tap the bathtub.",
    },
  },
  [normalizeText("Tap the bed.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_bed_62c246ed.wav",
      text: "Tap the bed.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_bed_62c246ed.wav",
      text: "Tap the bed.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_bed_62c246ed.wav",
      text: "Tap the bed.",
    },
  },
  [normalizeText("Tap the bench.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_tap_bench_08043b91.wav",
      text: "Tap the bench.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_tap_bench_08043b91.wav",
      text: "Tap the bench.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_tap_bench_08043b91.wav",
      text: "Tap the bench.",
    },
  },
  [normalizeText("Tap the bite.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_tap_bite_6a5ca268.wav",
      text: "Tap the bite.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_tap_bite_6a5ca268.wav",
      text: "Tap the bite.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_tap_bite_6a5ca268.wav",
      text: "Tap the bite.",
    },
  },
  [normalizeText("Tap the blocks.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_tap_blocks_64372539.wav",
      text: "Tap the blocks.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_tap_blocks_64372539.wav",
      text: "Tap the blocks.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_tap_blocks_64372539.wav",
      text: "Tap the blocks.",
    },
  },
  [normalizeText("Tap the board.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_tap_board_9165c834.wav",
      text: "Tap the board.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_tap_board_9165c834.wav",
      text: "Tap the board.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_tap_board_9165c834.wav",
      text: "Tap the board.",
    },
  },
  [normalizeText("Tap the book.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_tap_book_b3e79cca.wav",
      text: "Tap the book.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_tap_book_b3e79cca.wav",
      text: "Tap the book.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_tap_book_b3e79cca.wav",
      text: "Tap the book.",
    },
  },
  [normalizeText("Tap the bookmark.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_tap_bookmark_2af17d8f.wav",
      text: "Tap the bookmark.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_tap_bookmark_2af17d8f.wav",
      text: "Tap the bookmark.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_tap_bookmark_2af17d8f.wav",
      text: "Tap the bookmark.",
    },
  },
  [normalizeText("Tap the bottle.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_tap_bottle_95db3e5a.wav",
      text: "Tap the bottle.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_tap_bottle_95db3e5a.wav",
      text: "Tap the bottle.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_tap_bottle_95db3e5a.wav",
      text: "Tap the bottle.",
    },
  },
  [normalizeText("Tap the box.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_box_09add4a2.wav",
      text: "Tap the box.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_box_09add4a2.wav",
      text: "Tap the box.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_box_09add4a2.wav",
      text: "Tap the box.",
    },
  },
  [normalizeText("Tap the bread.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_review_bread_2e152ca0.wav",
      text: "Tap the bread.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_review_bread_2e152ca0.wav",
      text: "Tap the bread.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_review_bread_2e152ca0.wav",
      text: "Tap the bread.",
    },
  },
  [normalizeText("Tap the bubble.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_tap_bubble_44395199.wav",
      text: "Tap the bubble.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_tap_bubble_44395199.wav",
      text: "Tap the bubble.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_tap_bubble_44395199.wav",
      text: "Tap the bubble.",
    },
  },
  [normalizeText("Tap the bucket.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_tap_bucket_5b4d85af.wav",
      text: "Tap the bucket.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_tap_bucket_5b4d85af.wav",
      text: "Tap the bucket.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_tap_bucket_5b4d85af.wav",
      text: "Tap the bucket.",
    },
  },
  [normalizeText("Tap the bus.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_tap_bus_ad64a9fe.wav",
      text: "Tap the bus.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_tap_bus_ad64a9fe.wav",
      text: "Tap the bus.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_tap_bus_ad64a9fe.wav",
      text: "Tap the bus.",
    },
  },
  [normalizeText("Tap the cabinet.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_tap_cabinet_bf1eacf5.wav",
      text: "Tap the cabinet.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_tap_cabinet_bf1eacf5.wav",
      text: "Tap the cabinet.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_tap_cabinet_bf1eacf5.wav",
      text: "Tap the cabinet.",
    },
  },
  [normalizeText("Tap the chicken.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_tap_chicken_b3b60b80.wav",
      text: "Tap the chicken.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_tap_chicken_b3b60b80.wav",
      text: "Tap the chicken.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_tap_chicken_b3b60b80.wav",
      text: "Tap the chicken.",
    },
  },
  [normalizeText("Tap the clock.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_clock_317c3523.wav",
      text: "Tap the clock.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_clock_317c3523.wav",
      text: "Tap the clock.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_clock_317c3523.wav",
      text: "Tap the clock.",
    },
  },
  [normalizeText("Tap the cloth.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_tap_cloth_8403f051.wav",
      text: "Tap the cloth.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_cloth_8403f051.wav",
      text: "Tap the cloth.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_tap_cloth_8403f051.wav",
      text: "Tap the cloth.",
    },
  },
  [normalizeText("Tap the coaster.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_tap_coaster_5d25af24.wav",
      text: "Tap the coaster.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_tap_coaster_5d25af24.wav",
      text: "Tap the coaster.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_tap_coaster_5d25af24.wav",
      text: "Tap the coaster.",
    },
  },
  [normalizeText("Tap the comfort plush.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_tap_comfort_plush_f76e72bf.wav",
      text: "Tap the comfort plush.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_tap_comfort_plush_f76e72bf.wav",
      text: "Tap the comfort plush.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_tap_comfort_plush_f76e72bf.wav",
      text: "Tap the comfort plush.",
    },
  },
  [normalizeText("Tap the compost bin.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_tap_compost_bin_fbc83097.wav",
      text: "Tap the compost bin.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_tap_compost_bin_fbc83097.wav",
      text: "Tap the compost bin.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_tap_compost_bin_fbc83097.wav",
      text: "Tap the compost bin.",
    },
  },
  [normalizeText("Tap the cracker.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_tap_cracker_91c45b29.wav",
      text: "Tap the cracker.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_tap_cracker_91c45b29.wav",
      text: "Tap the cracker.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_tap_cracker_91c45b29.wav",
      text: "Tap the cracker.",
    },
  },
  [normalizeText("Tap the crayon.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_tap_crayon_cf4d5c91.wav",
      text: "Tap the crayon.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_tap_crayon_cf4d5c91.wav",
      text: "Tap the crayon.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_tap_crayon_cf4d5c91.wav",
      text: "Tap the crayon.",
    },
  },
  [normalizeText("Tap the crumbs.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_tap_crumbs_37ce8f50.wav",
      text: "Tap the crumbs.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_crumbs_37ce8f50.wav",
      text: "Tap the crumbs.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_tap_crumbs_37ce8f50.wav",
      text: "Tap the crumbs.",
    },
  },
  [normalizeText("Tap the cup.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_tap_cup_8644be05.wav",
      text: "Tap the cup.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_tap_cup_8644be05.wav",
      text: "Tap the cup.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_tap_cup_8644be05.wav",
      text: "Tap the cup.",
    },
  },
  [normalizeText("Tap the curtain.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_tap_curtain_28743ee0.wav",
      text: "Tap the curtain.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_tap_curtain_28743ee0.wav",
      text: "Tap the curtain.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_tap_curtain_28743ee0.wav",
      text: "Tap the curtain.",
    },
  },
  [normalizeText("Tap the desk.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_tap_desk_365cd0d3.wav",
      text: "Tap the desk.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_tap_desk_365cd0d3.wav",
      text: "Tap the desk.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_tap_desk_365cd0d3.wav",
      text: "Tap the desk.",
    },
  },
  [normalizeText("Tap the dessert.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_tap_dessert_a9c31498.wav",
      text: "Tap the dessert.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_dessert_a9c31498.wav",
      text: "Tap the dessert.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_tap_dessert_a9c31498.wav",
      text: "Tap the dessert.",
    },
  },
  [normalizeText("Tap the dining light.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_tap_dining_light_20c82694.wav",
      text: "Tap the dining light.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_dining_light_20c82694.wav",
      text: "Tap the dining light.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_tap_dining_light_20c82694.wav",
      text: "Tap the dining light.",
    },
  },
  [normalizeText("Tap the dinner bell.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_tap_dinner_bell_a220240b.wav",
      text: "Tap the dinner bell.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_tap_dinner_bell_a220240b.wav",
      text: "Tap the dinner bell.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_tap_dinner_bell_a220240b.wav",
      text: "Tap the dinner bell.",
    },
  },
  [normalizeText("Tap the dinner.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_tap_dinner_d2f7e92e.wav",
      text: "Tap the dinner.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_tap_dinner_d2f7e92e.wav",
      text: "Tap the dinner.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_tap_dinner_d2f7e92e.wav",
      text: "Tap the dinner.",
    },
  },
  [normalizeText("Tap the dish rack.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_tap_dish_rack_98765d42.wav",
      text: "Tap the dish rack.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_tap_dish_rack_98765d42.wav",
      text: "Tap the dish rack.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_tap_dish_rack_98765d42.wav",
      text: "Tap the dish rack.",
    },
  },
  [normalizeText("Tap the dishwasher.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_tap_dishwasher_5098c760.wav",
      text: "Tap the dishwasher.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_dishwasher_5098c760.wav",
      text: "Tap the dishwasher.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_tap_dishwasher_5098c760.wav",
      text: "Tap the dishwasher.",
    },
  },
  [normalizeText("Tap the doll.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_doll_2008ed77.wav",
      text: "Tap the doll.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_doll_2008ed77.wav",
      text: "Tap the doll.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_doll_2008ed77.wav",
      text: "Tap the doll.",
    },
  },
  [normalizeText("Tap the dream journal.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_tap_dream_journal_f7b6c428.wav",
      text: "Tap the dream journal.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_tap_dream_journal_f7b6c428.wav",
      text: "Tap the dream journal.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_tap_dream_journal_f7b6c428.wav",
      text: "Tap the dream journal.",
    },
  },
  [normalizeText("Tap the drum.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_tap_drum_2d12716c.wav",
      text: "Tap the drum.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_tap_drum_2d12716c.wav",
      text: "Tap the drum.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_tap_drum_2d12716c.wav",
      text: "Tap the drum.",
    },
  },
  [normalizeText("Tap the egg.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_tap_egg_b01b1cff.wav",
      text: "Tap the egg.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_tap_egg_b01b1cff.wav",
      text: "Tap the egg.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_tap_egg_b01b1cff.wav",
      text: "Tap the egg.",
    },
  },
  [normalizeText("Tap the elbow.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_tap_elbow_1803bff1.wav",
      text: "Tap the elbow.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_tap_elbow_1803bff1.wav",
      text: "Tap the elbow.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_tap_elbow_1803bff1.wav",
      text: "Tap the elbow.",
    },
  },
  [normalizeText("Tap the eraser.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_tap_eraser_0680b296.wav",
      text: "Tap the eraser.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_tap_eraser_0680b296.wav",
      text: "Tap the eraser.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_tap_eraser_0680b296.wav",
      text: "Tap the eraser.",
    },
  },
  [normalizeText("Tap the family.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_tap_family_c6ffbd5f.wav",
      text: "Tap the family.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_tap_family_c6ffbd5f.wav",
      text: "Tap the family.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_tap_family_c6ffbd5f.wav",
      text: "Tap the family.",
    },
  },
  [normalizeText("Tap the fish.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_tap_fish_1bc8ab79.wav",
      text: "Tap the fish.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_tap_fish_1bc8ab79.wav",
      text: "Tap the fish.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_tap_fish_1bc8ab79.wav",
      text: "Tap the fish.",
    },
  },
  [normalizeText("Tap the floor.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_tap_floor_9dc43e05.wav",
      text: "Tap the floor.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_floor_9dc43e05.wav",
      text: "Tap the floor.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_tap_floor_9dc43e05.wav",
      text: "Tap the floor.",
    },
  },
  [normalizeText("Tap the foam.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_tap_foam_af13f63b.wav",
      text: "Tap the foam.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_tap_foam_af13f63b.wav",
      text: "Tap the foam.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_tap_foam_af13f63b.wav",
      text: "Tap the foam.",
    },
  },
  [normalizeText("Tap the folder.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_tap_folder_806fba2d.wav",
      text: "Tap the folder.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_tap_folder_806fba2d.wav",
      text: "Tap the folder.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_tap_folder_806fba2d.wav",
      text: "Tap the folder.",
    },
  },
  [normalizeText("Tap the fork.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_tap_fork_26159bd7.wav",
      text: "Tap the fork.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_tap_fork_26159bd7.wav",
      text: "Tap the fork.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_tap_fork_26159bd7.wav",
      text: "Tap the fork.",
    },
  },
  [normalizeText("Tap the friend.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_tap_friend_01604ab2.wav",
      text: "Tap the friend.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_tap_friend_01604ab2.wav",
      text: "Tap the friend.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_tap_friend_01604ab2.wav",
      text: "Tap the friend.",
    },
  },
  [normalizeText("Tap the home.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_tap_home_f8778ddb.wav",
      text: "Tap the home.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_tap_home_f8778ddb.wav",
      text: "Tap the home.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_tap_home_f8778ddb.wav",
      text: "Tap the home.",
    },
  },
  [normalizeText("Tap the hook.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_tap_hook_f69bcb83.wav",
      text: "Tap the hook.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_tap_hook_f69bcb83.wav",
      text: "Tap the hook.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_tap_hook_f69bcb83.wav",
      text: "Tap the hook.",
    },
  },
  [normalizeText("Tap the jacket.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_tap_jacket_2caf05a8.wav",
      text: "Tap the jacket.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_tap_jacket_2caf05a8.wav",
      text: "Tap the jacket.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_tap_jacket_2caf05a8.wav",
      text: "Tap the jacket.",
    },
  },
  [normalizeText("Tap the juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_tap_juice_aa4c2038.wav",
      text: "Tap the juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_tap_juice_aa4c2038.wav",
      text: "Tap the juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_tap_juice_aa4c2038.wav",
      text: "Tap the juice.",
    },
  },
  [normalizeText("Tap the jump.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_tap_jump_hoop_1c8ba64c.wav",
      text: "Tap the jump.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_tap_jump_hoop_1c8ba64c.wav",
      text: "Tap the jump.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_tap_jump_hoop_1c8ba64c.wav",
      text: "Tap the jump.",
    },
  },
  [normalizeText("Tap the knee.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_tap_knee_50f37221.wav",
      text: "Tap the knee.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_tap_knee_50f37221.wav",
      text: "Tap the knee.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_tap_knee_50f37221.wav",
      text: "Tap the knee.",
    },
  },
  [normalizeText("Tap the lamp.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_lamp_20eb0c38.wav",
      text: "Tap the lamp.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_lamp_20eb0c38.wav",
      text: "Tap the lamp.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_lamp_20eb0c38.wav",
      text: "Tap the lamp.",
    },
  },
  [normalizeText("Tap the leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_tap_leftovers_53145017.wav",
      text: "Tap the leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_leftovers_53145017.wav",
      text: "Tap the leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_tap_leftovers_53145017.wav",
      text: "Tap the leftovers.",
    },
  },
  [normalizeText("Tap the lullaby.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_tap_lullaby_2dd7bc20.wav",
      text: "Tap the lullaby.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_tap_lullaby_2dd7bc20.wav",
      text: "Tap the lullaby.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_tap_lullaby_2dd7bc20.wav",
      text: "Tap the lullaby.",
    },
  },
  [normalizeText("Tap the lunchbox.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_tap_lunchbox_a42178c4.wav",
      text: "Tap the lunchbox.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_tap_lunchbox_a42178c4.wav",
      text: "Tap the lunchbox.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_tap_lunchbox_a42178c4.wav",
      text: "Tap the lunchbox.",
    },
  },
  [normalizeText("Tap the milk.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_tap_milk_75b204ca.wav",
      text: "Tap the milk.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_tap_milk_75b204ca.wav",
      text: "Tap the milk.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_tap_milk_75b204ca.wav",
      text: "Tap the milk.",
    },
  },
  [normalizeText("Tap the mirror.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_review_mirror_fd4363aa.wav",
      text: "Tap the mirror.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_review_mirror_fd4363aa.wav",
      text: "Tap the mirror.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_review_mirror_fd4363aa.wav",
      text: "Tap the mirror.",
    },
  },
  [normalizeText("Tap the moon mobile.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_tap_moon_mobile_bf898161.wav",
      text: "Tap the moon mobile.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_tap_moon_mobile_bf898161.wav",
      text: "Tap the moon mobile.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_tap_moon_mobile_bf898161.wav",
      text: "Tap the moon mobile.",
    },
  },
  [normalizeText("Tap the music.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_tap_music_03f3b58b.wav",
      text: "Tap the music.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_tap_music_03f3b58b.wav",
      text: "Tap the music.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_tap_music_03f3b58b.wav",
      text: "Tap the music.",
    },
  },
  [normalizeText("Tap the napkin.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_tap_napkin_30441408.wav",
      text: "Tap the napkin.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_tap_napkin_30441408.wav",
      text: "Tap the napkin.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_tap_napkin_30441408.wav",
      text: "Tap the napkin.",
    },
  },
  [normalizeText("Tap the night light.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_tap_night_light_5a5d671f.wav",
      text: "Tap the night light.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_tap_night_light_5a5d671f.wav",
      text: "Tap the night light.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_tap_night_light_5a5d671f.wav",
      text: "Tap the night light.",
    },
  },
  [normalizeText("Tap the pajamas.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_tap_pajamas_5e10e07e.wav",
      text: "Tap the pajamas.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_tap_pajamas_5e10e07e.wav",
      text: "Tap the pajamas.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_tap_pajamas_5e10e07e.wav",
      text: "Tap the pajamas.",
    },
  },
  [normalizeText("Tap the pencil.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_tap_pencil_d51a4caa.wav",
      text: "Tap the pencil.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_tap_pencil_d51a4caa.wav",
      text: "Tap the pencil.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_tap_pencil_d51a4caa.wav",
      text: "Tap the pencil.",
    },
  },
  [normalizeText("Tap the pillow.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_pillow_02f6fc23.wav",
      text: "Tap the pillow.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_pillow_02f6fc23.wav",
      text: "Tap the pillow.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_pillow_02f6fc23.wav",
      text: "Tap the pillow.",
    },
  },
  [normalizeText("Tap the plate.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_tap_plate_aa035936.wav",
      text: "Tap the plate.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_tap_plate_aa035936.wav",
      text: "Tap the plate.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_tap_plate_aa035936.wav",
      text: "Tap the plate.",
    },
  },
  [normalizeText("Tap the pot holder.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_tap_pot_holder_289cb3d4.wav",
      text: "Tap the pot holder.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_tap_pot_holder_289cb3d4.wav",
      text: "Tap the pot holder.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_tap_pot_holder_289cb3d4.wav",
      text: "Tap the pot holder.",
    },
  },
  [normalizeText("Tap the puzzle.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_tap_puzzle_a6333fcf.wav",
      text: "Tap the puzzle.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_tap_puzzle_a6333fcf.wav",
      text: "Tap the puzzle.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_tap_puzzle_a6333fcf.wav",
      text: "Tap the puzzle.",
    },
  },
  [normalizeText("Tap the raisins.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_tap_raisins_3e4d1aec.wav",
      text: "Tap the raisins.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_tap_raisins_3e4d1aec.wav",
      text: "Tap the raisins.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_tap_raisins_3e4d1aec.wav",
      text: "Tap the raisins.",
    },
  },
  [normalizeText("Tap the recycling bin.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_tap_recycling_bin_114931fc.wav",
      text: "Tap the recycling bin.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_tap_recycling_bin_114931fc.wav",
      text: "Tap the recycling bin.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_tap_recycling_bin_114931fc.wav",
      text: "Tap the recycling bin.",
    },
  },
  [normalizeText("Tap the rice.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_tap_rice_63dbb27d.wav",
      text: "Tap the rice.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_tap_rice_63dbb27d.wav",
      text: "Tap the rice.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_tap_rice_63dbb27d.wav",
      text: "Tap the rice.",
    },
  },
  [normalizeText("Tap the robe.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_tap_robe_8b17aa7b.wav",
      text: "Tap the robe.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_tap_robe_8b17aa7b.wav",
      text: "Tap the robe.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_tap_robe_8b17aa7b.wav",
      text: "Tap the robe.",
    },
  },
  [normalizeText("Tap the rope.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_tap_rope_1aea1747.wav",
      text: "Tap the rope.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_tap_rope_1aea1747.wav",
      text: "Tap the rope.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_tap_rope_1aea1747.wav",
      text: "Tap the rope.",
    },
  },
  [normalizeText("Tap the rubber gloves.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_tap_rubber_gloves_49af111b.wav",
      text: "Tap the rubber gloves.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_tap_rubber_gloves_49af111b.wav",
      text: "Tap the rubber gloves.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_tap_rubber_gloves_49af111b.wav",
      text: "Tap the rubber gloves.",
    },
  },
  [normalizeText("Tap the run.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_tap_run_path_001421f0.wav",
      text: "Tap the run.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_tap_run_path_001421f0.wav",
      text: "Tap the run.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_tap_run_path_001421f0.wav",
      text: "Tap the run.",
    },
  },
  [normalizeText("Tap the sandbox.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_tap_sandbox_b8c9a665.wav",
      text: "Tap the sandbox.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_tap_sandbox_b8c9a665.wav",
      text: "Tap the sandbox.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_tap_sandbox_b8c9a665.wav",
      text: "Tap the sandbox.",
    },
  },
  [normalizeText("Tap the sauce.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_tap_sauce_7316939a.wav",
      text: "Tap the sauce.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_tap_sauce_7316939a.wav",
      text: "Tap the sauce.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_tap_sauce_7316939a.wav",
      text: "Tap the sauce.",
    },
  },
  [normalizeText("Tap the school.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_review_school_ac4e92c8.wav",
      text: "Tap the school.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_review_school_ac4e92c8.wav",
      text: "Tap the school.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_review_school_ac4e92c8.wav",
      text: "Tap the school.",
    },
  },
  [normalizeText("Tap the scraper.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_tap_scraper_d7b04c41.wav",
      text: "Tap the scraper.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_tap_scraper_d7b04c41.wav",
      text: "Tap the scraper.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_tap_scraper_d7b04c41.wav",
      text: "Tap the scraper.",
    },
  },
  [normalizeText("Tap the seesaw.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_tap_seesaw_988b8c2d.wav",
      text: "Tap the seesaw.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_tap_seesaw_988b8c2d.wav",
      text: "Tap the seesaw.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_tap_seesaw_988b8c2d.wav",
      text: "Tap the seesaw.",
    },
  },
  [normalizeText("Tap the serving tray.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_tap_serving_tray_ca03ac38.wav",
      text: "Tap the serving tray.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_tap_serving_tray_ca03ac38.wav",
      text: "Tap the serving tray.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_tap_serving_tray_ca03ac38.wav",
      text: "Tap the serving tray.",
    },
  },
  [normalizeText("Tap the shade.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_tap_shade_19850722.wav",
      text: "Tap the shade.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_tap_shade_19850722.wav",
      text: "Tap the shade.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_tap_shade_19850722.wav",
      text: "Tap the shade.",
    },
  },
  [normalizeText("Tap the shampoo.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_shampoo_d41c5396.wav",
      text: "Tap the shampoo.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_shampoo_d41c5396.wav",
      text: "Tap the shampoo.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_shampoo_d41c5396.wav",
      text: "Tap the shampoo.",
    },
  },
  [normalizeText("Tap the shelf.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_tap_shelf_53619846.wav",
      text: "Tap the shelf.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_tap_shelf_53619846.wav",
      text: "Tap the shelf.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_tap_shelf_53619846.wav",
      text: "Tap the shelf.",
    },
  },
  [normalizeText("Tap the shoes.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_tap_shoes_c174f086.wav",
      text: "Tap the shoes.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_tap_shoes_c174f086.wav",
      text: "Tap the shoes.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_tap_shoes_c174f086.wav",
      text: "Tap the shoes.",
    },
  },
  [normalizeText("Tap the shoulder.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_tap_shoulder_dd24996f.wav",
      text: "Tap the shoulder.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_tap_shoulder_dd24996f.wav",
      text: "Tap the shoulder.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_tap_shoulder_dd24996f.wav",
      text: "Tap the shoulder.",
    },
  },
  [normalizeText("Tap the shower head.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_tap_shower_head_b3b67272.wav",
      text: "Tap the shower head.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_tap_shower_head_b3b67272.wav",
      text: "Tap the shower head.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_tap_shower_head_b3b67272.wav",
      text: "Tap the shower head.",
    },
  },
  [normalizeText("Tap the shower.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_shower_739afe05.wav",
      text: "Tap the shower.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_shower_739afe05.wav",
      text: "Tap the shower.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_shower_739afe05.wav",
      text: "Tap the shower.",
    },
  },
  [normalizeText("Tap the sink.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_tap_sink_1b158ce6.wav",
      text: "Tap the sink.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_tap_sink_1b158ce6.wav",
      text: "Tap the sink.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_tap_sink_1b158ce6.wav",
      text: "Tap the sink.",
    },
  },
  [normalizeText("Tap the sleep mask.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_tap_sleep_mask_bb60194a.wav",
      text: "Tap the sleep mask.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_tap_sleep_mask_bb60194a.wav",
      text: "Tap the sleep mask.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_tap_sleep_mask_bb60194a.wav",
      text: "Tap the sleep mask.",
    },
  },
  [normalizeText("Tap the slide.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_tap_slide_e34fad6a.wav",
      text: "Tap the slide.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_tap_slide_e34fad6a.wav",
      text: "Tap the slide.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_tap_slide_e34fad6a.wav",
      text: "Tap the slide.",
    },
  },
  [normalizeText("Tap the snack box.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_tap_snack_box_03f7d4f4.wav",
      text: "Tap the snack box.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_tap_snack_box_03f7d4f4.wav",
      text: "Tap the snack box.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_tap_snack_box_03f7d4f4.wav",
      text: "Tap the snack box.",
    },
  },
  [normalizeText("Tap the snack.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_tap_snack_35f57f65.wav",
      text: "Tap the snack.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_tap_snack_35f57f65.wav",
      text: "Tap the snack.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_tap_snack_35f57f65.wav",
      text: "Tap the snack.",
    },
  },
  [normalizeText("Tap the soap.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_tap_soap_dc576737.wav",
      text: "Tap the soap.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_tap_soap_dc576737.wav",
      text: "Tap the soap.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_tap_soap_dc576737.wav",
      text: "Tap the soap.",
    },
  },
  [normalizeText("Tap the socks.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_practice_socks_3e603a84.wav",
      text: "Tap the socks.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_practice_socks_3e603a84.wav",
      text: "Tap the socks.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_practice_socks_3e603a84.wav",
      text: "Tap the socks.",
    },
  },
  [normalizeText("Tap the soft voice.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_tap_soft_voice_7fa58760.wav",
      text: "Tap the soft voice.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_tap_soft_voice_7fa58760.wav",
      text: "Tap the soft voice.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_tap_soft_voice_7fa58760.wav",
      text: "Tap the soft voice.",
    },
  },
  [normalizeText("Tap the soup.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_tap_soup_88afbcae.wav",
      text: "Tap the soup.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_tap_soup_88afbcae.wav",
      text: "Tap the soup.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_tap_soup_88afbcae.wav",
      text: "Tap the soup.",
    },
  },
  [normalizeText("Tap the spill.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_tap_spill_e006b269.wav",
      text: "Tap the spill.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_tap_spill_e006b269.wav",
      text: "Tap the spill.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_tap_spill_e006b269.wav",
      text: "Tap the spill.",
    },
  },
  [normalizeText("Tap the stain.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_tap_stain_c9a86ad6.wav",
      text: "Tap the stain.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_tap_stain_c9a86ad6.wav",
      text: "Tap the stain.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_tap_stain_c9a86ad6.wav",
      text: "Tap the stain.",
    },
  },
  [normalizeText("Tap the star projector.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_tap_star_projector_621033d5.wav",
      text: "Tap the star projector.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_tap_star_projector_621033d5.wav",
      text: "Tap the star projector.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_tap_star_projector_621033d5.wav",
      text: "Tap the star projector.",
    },
  },
  [normalizeText("Tap the story shelf.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_tap_story_shelf_041d9a45.wav",
      text: "Tap the story shelf.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_tap_story_shelf_041d9a45.wav",
      text: "Tap the story shelf.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_tap_story_shelf_041d9a45.wav",
      text: "Tap the story shelf.",
    },
  },
  [normalizeText("Tap the storybook.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_tap_storybook_3c7e9e7e.wav",
      text: "Tap the storybook.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_tap_storybook_3c7e9e7e.wav",
      text: "Tap the storybook.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_tap_storybook_3c7e9e7e.wav",
      text: "Tap the storybook.",
    },
  },
  [normalizeText("Tap the sun.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_review_sun_88094e22.wav",
      text: "Tap the sun.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_review_sun_88094e22.wav",
      text: "Tap the sun.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_review_sun_88094e22.wav",
      text: "Tap the sun.",
    },
  },
  [normalizeText("Tap the swing.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_tap_swing_8c5c43bd.wav",
      text: "Tap the swing.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_tap_swing_8c5c43bd.wav",
      text: "Tap the swing.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_tap_swing_8c5c43bd.wav",
      text: "Tap the swing.",
    },
  },
  [normalizeText("Tap the table.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_tap_table_488163a8.wav",
      text: "Tap the table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_tap_table_488163a8.wav",
      text: "Tap the table.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_tap_table_488163a8.wav",
      text: "Tap the table.",
    },
  },
  [normalizeText("Tap the teacher.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_tap_teacher_02df73f4.wav",
      text: "Tap the teacher.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_tap_teacher_02df73f4.wav",
      text: "Tap the teacher.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_tap_teacher_02df73f4.wav",
      text: "Tap the teacher.",
    },
  },
  [normalizeText("Tap the timer.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_tap_timer_0661bb7e.wav",
      text: "Tap the timer.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_tap_timer_0661bb7e.wav",
      text: "Tap the timer.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_tap_timer_0661bb7e.wav",
      text: "Tap the timer.",
    },
  },
  [normalizeText("Tap the tongs.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_tap_tongs_84516792.wav",
      text: "Tap the tongs.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_tap_tongs_84516792.wav",
      text: "Tap the tongs.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_tap_tongs_84516792.wav",
      text: "Tap the tongs.",
    },
  },
  [normalizeText("Tap the toothbrush.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_tap_toothbrush_9d63c70c.wav",
      text: "Tap the toothbrush.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_tap_toothbrush_9d63c70c.wav",
      text: "Tap the toothbrush.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_tap_toothbrush_9d63c70c.wav",
      text: "Tap the toothbrush.",
    },
  },
  [normalizeText("Tap the towel.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_tap_towel_5cc4bada.wav",
      text: "Tap the towel.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_tap_towel_5cc4bada.wav",
      text: "Tap the towel.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_tap_towel_5cc4bada.wav",
      text: "Tap the towel.",
    },
  },
  [normalizeText("Tap the toy.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_tap_toy_3dabb3e2.wav",
      text: "Tap the toy.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_tap_toy_3dabb3e2.wav",
      text: "Tap the toy.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_tap_toy_3dabb3e2.wav",
      text: "Tap the toy.",
    },
  },
  [normalizeText("Tap the traffic light.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_tap_traffic_light_8b14b3a5.wav",
      text: "Tap the traffic light.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_tap_traffic_light_8b14b3a5.wav",
      text: "Tap the traffic light.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_tap_traffic_light_8b14b3a5.wav",
      text: "Tap the traffic light.",
    },
  },
  [normalizeText("Tap the tray.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_tap_tray_6d12e2d9.wav",
      text: "Tap the tray.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_tap_tray_6d12e2d9.wav",
      text: "Tap the tray.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_tap_tray_6d12e2d9.wav",
      text: "Tap the tray.",
    },
  },
  [normalizeText("Tap the uniform.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_tap_uniform_d9292e3c.wav",
      text: "Tap the uniform.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_tap_uniform_d9292e3c.wav",
      text: "Tap the uniform.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_tap_uniform_d9292e3c.wav",
      text: "Tap the uniform.",
    },
  },
  [normalizeText("Tap the vegetables.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_tap_vegetables_c7e386f8.wav",
      text: "Tap the vegetables.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_tap_vegetables_c7e386f8.wav",
      text: "Tap the vegetables.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_tap_vegetables_c7e386f8.wav",
      text: "Tap the vegetables.",
    },
  },
  [normalizeText("Tap the wait.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_tap_wait_clock_771a4aa0.wav",
      text: "Tap the wait.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_tap_wait_clock_771a4aa0.wav",
      text: "Tap the wait.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_tap_wait_clock_771a4aa0.wav",
      text: "Tap the wait.",
    },
  },
  [normalizeText("Tap the water.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_tap_water_13b6b394.wav",
      text: "Tap the water.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_tap_water_13b6b394.wav",
      text: "Tap the water.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_tap_water_13b6b394.wav",
      text: "Tap the water.",
    },
  },
  [normalizeText("Tap the window.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_tap_window_a3528d6c.wav",
      text: "Tap the window.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_tap_window_a3528d6c.wav",
      text: "Tap the window.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_tap_window_a3528d6c.wav",
      text: "Tap the window.",
    },
  },
  [normalizeText("Tap the yogurt.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_tap_yogurt_a490217c.wav",
      text: "Tap the yogurt.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_tap_yogurt_a490217c.wav",
      text: "Tap the yogurt.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_tap_yogurt_a490217c.wav",
      text: "Tap the yogurt.",
    },
  },
  [normalizeText("teacher")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/teacher.wav",
      text: "teacher",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/teacher.wav",
      text: "teacher",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/teacher.wav",
      text: "teacher",
    },
  },
  [normalizeText("Teacher Says is complete.")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/completion_03a26cf9.wav",
      text: "Teacher Says is complete.",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/completion_03a26cf9.wav",
      text: "Teacher Says is complete.",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/completion_03a26cf9.wav",
      text: "Teacher Says is complete.",
    },
  },
  [normalizeText("Teacher says!")]: {
    "en-US": {
      key: "lessons/at-school/teacher-instructions/audio/en-US/neural2-c-r1/prompt_instructions_intro_322d0bc5.wav",
      text: "Teacher says!",
    },
    "en-GB": {
      key: "lessons/at-school/teacher-instructions/audio/en-GB/neural2-c-r1/prompt_instructions_intro_322d0bc5.wav",
      text: "Teacher says!",
    },
    legacy: {
      key: "lessons/at-school/teacher-instructions/audio/en/prompt_instructions_intro_322d0bc5.wav",
      text: "Teacher says!",
    },
  },
  [normalizeText("The Ride Home is complete.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/completion_41252568.wav",
      text: "The Ride Home is complete.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/completion_41252568.wav",
      text: "The Ride Home is complete.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/completion_41252568.wav",
      text: "The Ride Home is complete.",
    },
  },
  [normalizeText("This is the apple.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_apple_640ad69c.wav",
      text: "This is the apple.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_apple_640ad69c.wav",
      text: "This is the apple.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_apple_640ad69c.wav",
      text: "This is the apple.",
    },
  },
  [normalizeText("This is the apron.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_apron_805bdffd.wav",
      text: "This is the apron.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_apron_805bdffd.wav",
      text: "This is the apron.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_apron_805bdffd.wav",
      text: "This is the apron.",
    },
  },
  [normalizeText("This is the bag.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_bag_afcca2ea.wav",
      text: "This is the bag.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_bag_afcca2ea.wav",
      text: "This is the bag.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_bag_afcca2ea.wav",
      text: "This is the bag.",
    },
  },
  [normalizeText("This is the ball.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_ball_29820c8b.wav",
      text: "This is the ball.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_ball_29820c8b.wav",
      text: "This is the ball.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_ball_29820c8b.wav",
      text: "This is the ball.",
    },
  },
  [normalizeText("This is the banana.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_banana_cc8e043c.wav",
      text: "This is the banana.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_banana_cc8e043c.wav",
      text: "This is the banana.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_banana_cc8e043c.wav",
      text: "This is the banana.",
    },
  },
  [normalizeText("This is the basket.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_teach_basket_a936b8f0.wav",
      text: "This is the basket.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_basket_a936b8f0.wav",
      text: "This is the basket.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_teach_basket_a936b8f0.wav",
      text: "This is the basket.",
    },
  },
  [normalizeText("This is the bath mat.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_bath_mat_51d4fc49.wav",
      text: "This is the bath mat.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_bath_mat_51d4fc49.wav",
      text: "This is the bath mat.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_bath_mat_51d4fc49.wav",
      text: "This is the bath mat.",
    },
  },
  [normalizeText("This is the bath sponge.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_bath_sponge_81cb5826.wav",
      text: "This is the bath sponge.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_bath_sponge_81cb5826.wav",
      text: "This is the bath sponge.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_bath_sponge_81cb5826.wav",
      text: "This is the bath sponge.",
    },
  },
  [normalizeText("This is the bathtub.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_bathtub_9c88f3d4.wav",
      text: "This is the bathtub.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_bathtub_9c88f3d4.wav",
      text: "This is the bathtub.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_bathtub_9c88f3d4.wav",
      text: "This is the bathtub.",
    },
  },
  [normalizeText("This is the bed.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_bed_084c0b4a.wav",
      text: "This is the bed.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_bed_084c0b4a.wav",
      text: "This is the bed.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_bed_084c0b4a.wav",
      text: "This is the bed.",
    },
  },
  [normalizeText("This is the bench.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_bench_ca322aac.wav",
      text: "This is the bench.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_bench_ca322aac.wav",
      text: "This is the bench.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_bench_ca322aac.wav",
      text: "This is the bench.",
    },
  },
  [normalizeText("This is the blanket.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_blanket_13c8efe9.wav",
      text: "This is the blanket.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_blanket_13c8efe9.wav",
      text: "This is the blanket.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_blanket_13c8efe9.wav",
      text: "This is the blanket.",
    },
  },
  [normalizeText("This is the blocks.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_blocks_29f62197.wav",
      text: "This is the blocks.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_blocks_29f62197.wav",
      text: "This is the blocks.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_blocks_29f62197.wav",
      text: "This is the blocks.",
    },
  },
  [normalizeText("This is the board.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_board_f2125fda.wav",
      text: "This is the board.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_board_f2125fda.wav",
      text: "This is the board.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_board_f2125fda.wav",
      text: "This is the board.",
    },
  },
  [normalizeText("This is the body wash.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_body_wash_158628d9.wav",
      text: "This is the body wash.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_body_wash_158628d9.wav",
      text: "This is the body wash.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_body_wash_158628d9.wav",
      text: "This is the body wash.",
    },
  },
  [normalizeText("This is the book.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_book_d7a255c4.wav",
      text: "This is the book.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_book_d7a255c4.wav",
      text: "This is the book.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_book_d7a255c4.wav",
      text: "This is the book.",
    },
  },
  [normalizeText("This is the bookmark.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_bookmark_129033ee.wav",
      text: "This is the bookmark.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_bookmark_129033ee.wav",
      text: "This is the bookmark.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_bookmark_129033ee.wav",
      text: "This is the bookmark.",
    },
  },
  [normalizeText("This is the bottle.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_bottle_8134b853.wav",
      text: "This is the bottle.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_bottle_8134b853.wav",
      text: "This is the bottle.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_bottle_8134b853.wav",
      text: "This is the bottle.",
    },
  },
  [normalizeText("This is the bowl.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_bowl_c634b171.wav",
      text: "This is the bowl.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_bowl_c634b171.wav",
      text: "This is the bowl.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_bowl_c634b171.wav",
      text: "This is the bowl.",
    },
  },
  [normalizeText("This is the box.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_box_8d919bcd.wav",
      text: "This is the box.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_box_8d919bcd.wav",
      text: "This is the box.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_box_8d919bcd.wav",
      text: "This is the box.",
    },
  },
  [normalizeText("This is the bubble.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_bubble_c7c0afbd.wav",
      text: "This is the bubble.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_bubble_c7c0afbd.wav",
      text: "This is the bubble.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_bubble_c7c0afbd.wav",
      text: "This is the bubble.",
    },
  },
  [normalizeText("This is the bucket.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_bucket_c3745fcf.wav",
      text: "This is the bucket.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_bucket_c3745fcf.wav",
      text: "This is the bucket.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_bucket_c3745fcf.wav",
      text: "This is the bucket.",
    },
  },
  [normalizeText("This is the bus.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_bus_08262c43.wav",
      text: "This is the bus.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_bus_08262c43.wav",
      text: "This is the bus.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_bus_08262c43.wav",
      text: "This is the bus.",
    },
  },
  [normalizeText("This is the cabinet.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_cabinet_fa4c8b5a.wav",
      text: "This is the cabinet.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_cabinet_fa4c8b5a.wav",
      text: "This is the cabinet.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_cabinet_fa4c8b5a.wav",
      text: "This is the cabinet.",
    },
  },
  [normalizeText("This is the car.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/prompt_teach_car_de670624.wav",
      text: "This is the car.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/prompt_teach_car_de670624.wav",
      text: "This is the car.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/prompt_teach_car_de670624.wav",
      text: "This is the car.",
    },
  },
  [normalizeText("This is the carafe.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_carafe_b0ea0318.wav",
      text: "This is the carafe.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_carafe_b0ea0318.wav",
      text: "This is the carafe.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_carafe_b0ea0318.wav",
      text: "This is the carafe.",
    },
  },
  [normalizeText("This is the chair.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_chair_ef873d08.wav",
      text: "This is the chair.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_chair_ef873d08.wav",
      text: "This is the chair.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_chair_ef873d08.wav",
      text: "This is the chair.",
    },
  },
  [normalizeText("This is the chicken.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_chicken_1d4e4a4d.wav",
      text: "This is the chicken.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_chicken_1d4e4a4d.wav",
      text: "This is the chicken.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_chicken_1d4e4a4d.wav",
      text: "This is the chicken.",
    },
  },
  [normalizeText("This is the classroom.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_classroom_71792c6d.wav",
      text: "This is the classroom.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_classroom_71792c6d.wav",
      text: "This is the classroom.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_classroom_71792c6d.wav",
      text: "This is the classroom.",
    },
  },
  [normalizeText("This is the cleaning brush.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_cleaning_brush_12b8da1e.wav",
      text: "This is the cleaning brush.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_cleaning_brush_12b8da1e.wav",
      text: "This is the cleaning brush.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_cleaning_brush_12b8da1e.wav",
      text: "This is the cleaning brush.",
    },
  },
  [normalizeText("This is the clock.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_clock_2f7d17b4.wav",
      text: "This is the clock.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_clock_2f7d17b4.wav",
      text: "This is the clock.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_clock_2f7d17b4.wav",
      text: "This is the clock.",
    },
  },
  [normalizeText("This is the cloth.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_teach_cloth_c086519c.wav",
      text: "This is the cloth.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_cloth_c086519c.wav",
      text: "This is the cloth.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_teach_cloth_c086519c.wav",
      text: "This is the cloth.",
    },
  },
  [normalizeText("This is the coaster.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_coaster_018fe974.wav",
      text: "This is the coaster.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_coaster_018fe974.wav",
      text: "This is the coaster.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_coaster_018fe974.wav",
      text: "This is the coaster.",
    },
  },
  [normalizeText("This is the comb.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_comb_5362488f.wav",
      text: "This is the comb.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_comb_5362488f.wav",
      text: "This is the comb.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_comb_5362488f.wav",
      text: "This is the comb.",
    },
  },
  [normalizeText("This is the comfort plush.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_comfort_plush_a9bf5855.wav",
      text: "This is the comfort plush.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_comfort_plush_a9bf5855.wav",
      text: "This is the comfort plush.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_comfort_plush_a9bf5855.wav",
      text: "This is the comfort plush.",
    },
  },
  [normalizeText("This is the compost bin.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_compost_bin_6bca69b6.wav",
      text: "This is the compost bin.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_compost_bin_6bca69b6.wav",
      text: "This is the compost bin.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_compost_bin_6bca69b6.wav",
      text: "This is the compost bin.",
    },
  },
  [normalizeText("This is the cookie.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_cookie_cf69a2df.wav",
      text: "This is the cookie.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_cookie_cf69a2df.wav",
      text: "This is the cookie.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_cookie_cf69a2df.wav",
      text: "This is the cookie.",
    },
  },
  [normalizeText("This is the cracker.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_cracker_915a3650.wav",
      text: "This is the cracker.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_cracker_915a3650.wav",
      text: "This is the cracker.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_cracker_915a3650.wav",
      text: "This is the cracker.",
    },
  },
  [normalizeText("This is the crayon.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_crayon_4e4d2eae.wav",
      text: "This is the crayon.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_crayon_4e4d2eae.wav",
      text: "This is the crayon.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_crayon_4e4d2eae.wav",
      text: "This is the crayon.",
    },
  },
  [normalizeText("This is the crumbs.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_teach_crumbs_835625cb.wav",
      text: "This is the crumbs.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_teach_crumbs_835625cb.wav",
      text: "This is the crumbs.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_teach_crumbs_835625cb.wav",
      text: "This is the crumbs.",
    },
  },
  [normalizeText("This is the cup.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_cup_a09b7cea.wav",
      text: "This is the cup.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_cup_a09b7cea.wav",
      text: "This is the cup.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_cup_a09b7cea.wav",
      text: "This is the cup.",
    },
  },
  [normalizeText("This is the curtain.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_curtain_a3f8c0fb.wav",
      text: "This is the curtain.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_curtain_a3f8c0fb.wav",
      text: "This is the curtain.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_curtain_a3f8c0fb.wav",
      text: "This is the curtain.",
    },
  },
  [normalizeText("This is the desk.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_desk_f7b52232.wav",
      text: "This is the desk.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_desk_f7b52232.wav",
      text: "This is the desk.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_desk_f7b52232.wav",
      text: "This is the desk.",
    },
  },
  [normalizeText("This is the dessert.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_dessert_7f635a15.wav",
      text: "This is the dessert.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_dessert_7f635a15.wav",
      text: "This is the dessert.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_dessert_7f635a15.wav",
      text: "This is the dessert.",
    },
  },
  [normalizeText("This is the dining light.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_dining_light_be1cf7b6.wav",
      text: "This is the dining light.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_dining_light_be1cf7b6.wav",
      text: "This is the dining light.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_dining_light_be1cf7b6.wav",
      text: "This is the dining light.",
    },
  },
  [normalizeText("This is the dinner bell.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_dinner_bell_81f2c6d3.wav",
      text: "This is the dinner bell.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_dinner_bell_81f2c6d3.wav",
      text: "This is the dinner bell.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_dinner_bell_81f2c6d3.wav",
      text: "This is the dinner bell.",
    },
  },
  [normalizeText("This is the dinner.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_dinner_5ed36280.wav",
      text: "This is the dinner.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_dinner_5ed36280.wav",
      text: "This is the dinner.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_dinner_5ed36280.wav",
      text: "This is the dinner.",
    },
  },
  [normalizeText("This is the dish rack.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_dish_rack_1bf52a9b.wav",
      text: "This is the dish rack.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_dish_rack_1bf52a9b.wav",
      text: "This is the dish rack.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_dish_rack_1bf52a9b.wav",
      text: "This is the dish rack.",
    },
  },
  [normalizeText("This is the dishwasher.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_dishwasher_fe721b11.wav",
      text: "This is the dishwasher.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_dishwasher_fe721b11.wav",
      text: "This is the dishwasher.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_dishwasher_fe721b11.wav",
      text: "This is the dishwasher.",
    },
  },
  [normalizeText("This is the doll.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_doll_796b5265.wav",
      text: "This is the doll.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_doll_796b5265.wav",
      text: "This is the doll.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_doll_796b5265.wav",
      text: "This is the doll.",
    },
  },
  [normalizeText("This is the door.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_teach_door_5ee8a9b6.wav",
      text: "This is the door.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_teach_door_5ee8a9b6.wav",
      text: "This is the door.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_teach_door_5ee8a9b6.wav",
      text: "This is the door.",
    },
  },
  [normalizeText("This is the dream journal.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_dream_journal_d8df0de4.wav",
      text: "This is the dream journal.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_dream_journal_d8df0de4.wav",
      text: "This is the dream journal.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_dream_journal_d8df0de4.wav",
      text: "This is the dream journal.",
    },
  },
  [normalizeText("This is the drum.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_drum_94a68aa8.wav",
      text: "This is the drum.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_drum_94a68aa8.wav",
      text: "This is the drum.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_drum_94a68aa8.wav",
      text: "This is the drum.",
    },
  },
  [normalizeText("This is the drying mat.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_drying_mat_d692f121.wav",
      text: "This is the drying mat.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_drying_mat_d692f121.wav",
      text: "This is the drying mat.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_drying_mat_d692f121.wav",
      text: "This is the drying mat.",
    },
  },
  [normalizeText("This is the egg.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_egg_5d3924c6.wav",
      text: "This is the egg.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_egg_5d3924c6.wav",
      text: "This is the egg.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_egg_5d3924c6.wav",
      text: "This is the egg.",
    },
  },
  [normalizeText("This is the elbow.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_elbow_8f700de5.wav",
      text: "This is the elbow.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_elbow_8f700de5.wav",
      text: "This is the elbow.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_elbow_8f700de5.wav",
      text: "This is the elbow.",
    },
  },
  [normalizeText("This is the eraser.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_eraser_ecc3a7eb.wav",
      text: "This is the eraser.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_eraser_ecc3a7eb.wav",
      text: "This is the eraser.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_eraser_ecc3a7eb.wav",
      text: "This is the eraser.",
    },
  },
  [normalizeText("This is the family.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_teach_family_285847b3.wav",
      text: "This is the family.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_teach_family_285847b3.wav",
      text: "This is the family.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_teach_family_285847b3.wav",
      text: "This is the family.",
    },
  },
  [normalizeText("This is the fish.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_fish_012dc6dd.wav",
      text: "This is the fish.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_fish_012dc6dd.wav",
      text: "This is the fish.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_fish_012dc6dd.wav",
      text: "This is the fish.",
    },
  },
  [normalizeText("This is the floor.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_teach_floor_8596cb1f.wav",
      text: "This is the floor.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_floor_8596cb1f.wav",
      text: "This is the floor.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_teach_floor_8596cb1f.wav",
      text: "This is the floor.",
    },
  },
  [normalizeText("This is the foam.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_foam_160f1164.wav",
      text: "This is the foam.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_foam_160f1164.wav",
      text: "This is the foam.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_foam_160f1164.wav",
      text: "This is the foam.",
    },
  },
  [normalizeText("This is the folder.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_teach_folder_683a2e65.wav",
      text: "This is the folder.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_teach_folder_683a2e65.wav",
      text: "This is the folder.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_teach_folder_683a2e65.wav",
      text: "This is the folder.",
    },
  },
  [normalizeText("This is the food cover.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_food_cover_8b727664.wav",
      text: "This is the food cover.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_food_cover_8b727664.wav",
      text: "This is the food cover.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_food_cover_8b727664.wav",
      text: "This is the food cover.",
    },
  },
  [normalizeText("This is the fork.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_fork_31f37e4a.wav",
      text: "This is the fork.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_fork_31f37e4a.wav",
      text: "This is the fork.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_fork_31f37e4a.wav",
      text: "This is the fork.",
    },
  },
  [normalizeText("This is the friend.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_friend_e411de90.wav",
      text: "This is the friend.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_friend_e411de90.wav",
      text: "This is the friend.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_friend_e411de90.wav",
      text: "This is the friend.",
    },
  },
  [normalizeText("This is the fruit.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_teach_fruit_1b8b3d81.wav",
      text: "This is the fruit.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_teach_fruit_1b8b3d81.wav",
      text: "This is the fruit.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_teach_fruit_1b8b3d81.wav",
      text: "This is the fruit.",
    },
  },
  [normalizeText("This is the glow sticker.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_glow_sticker_5fa9acaf.wav",
      text: "This is the glow sticker.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_glow_sticker_5fa9acaf.wav",
      text: "This is the glow sticker.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_glow_sticker_5fa9acaf.wav",
      text: "This is the glow sticker.",
    },
  },
  [normalizeText("This is the home.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_home_c4eaf3c0.wav",
      text: "This is the home.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_home_c4eaf3c0.wav",
      text: "This is the home.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_home_c4eaf3c0.wav",
      text: "This is the home.",
    },
  },
  [normalizeText("This is the hook.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_hook_134d07d7.wav",
      text: "This is the hook.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_hook_134d07d7.wav",
      text: "This is the hook.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_hook_134d07d7.wav",
      text: "This is the hook.",
    },
  },
  [normalizeText("This is the humidifier.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_humidifier_ae228cda.wav",
      text: "This is the humidifier.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_humidifier_ae228cda.wav",
      text: "This is the humidifier.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_humidifier_ae228cda.wav",
      text: "This is the humidifier.",
    },
  },
  [normalizeText("This is the jacket.")]: {
    "en-US": {
      key: "lessons/afternoon-home/going-home/audio/en-US/neural2-c-r1/prompt_teach_jacket_83f4e282.wav",
      text: "This is the jacket.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/going-home/audio/en-GB/neural2-c-r1/prompt_teach_jacket_83f4e282.wav",
      text: "This is the jacket.",
    },
    legacy: {
      key: "lessons/afternoon-home/going-home/audio/en/prompt_teach_jacket_83f4e282.wav",
      text: "This is the jacket.",
    },
  },
  [normalizeText("This is the juice.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_juice_5e66a7a3.wav",
      text: "This is the juice.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_juice_5e66a7a3.wav",
      text: "This is the juice.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_juice_5e66a7a3.wav",
      text: "This is the juice.",
    },
  },
  [normalizeText("This is the kitchen counter.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_kitchen_counter_48057411.wav",
      text: "This is the kitchen counter.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_kitchen_counter_48057411.wav",
      text: "This is the kitchen counter.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_kitchen_counter_48057411.wav",
      text: "This is the kitchen counter.",
    },
  },
  [normalizeText("This is the kite.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_kite_08880e09.wav",
      text: "This is the kite.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_kite_08880e09.wav",
      text: "This is the kite.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_kite_08880e09.wav",
      text: "This is the kite.",
    },
  },
  [normalizeText("This is the knee.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_knee_85e6cdd8.wav",
      text: "This is the knee.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_knee_85e6cdd8.wav",
      text: "This is the knee.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_knee_85e6cdd8.wav",
      text: "This is the knee.",
    },
  },
  [normalizeText("This is the label.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_label_d3d24d43.wav",
      text: "This is the label.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_label_d3d24d43.wav",
      text: "This is the label.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_label_d3d24d43.wav",
      text: "This is the label.",
    },
  },
  [normalizeText("This is the ladle.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_ladle_6b808f9f.wav",
      text: "This is the ladle.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_ladle_6b808f9f.wav",
      text: "This is the ladle.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_ladle_6b808f9f.wav",
      text: "This is the ladle.",
    },
  },
  [normalizeText("This is the lamp.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_lamp_c18ec954.wav",
      text: "This is the lamp.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_lamp_c18ec954.wav",
      text: "This is the lamp.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_lamp_c18ec954.wav",
      text: "This is the lamp.",
    },
  },
  [normalizeText("This is the laundry basket.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_laundry_basket_fa3a99d2.wav",
      text: "This is the laundry basket.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_laundry_basket_fa3a99d2.wav",
      text: "This is the laundry basket.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_laundry_basket_fa3a99d2.wav",
      text: "This is the laundry basket.",
    },
  },
  [normalizeText("This is the leftovers.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-US/neural2-c-r1/prompt_teach_leftovers_9e9db52b.wav",
      text: "This is the leftovers.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_leftovers_9e9db52b.wav",
      text: "This is the leftovers.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-cleanup/audio/en/prompt_teach_leftovers_9e9db52b.wav",
      text: "This is the leftovers.",
    },
  },
  [normalizeText("This is the lullaby.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_lullaby_49943bb6.wav",
      text: "This is the lullaby.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_lullaby_49943bb6.wav",
      text: "This is the lullaby.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_lullaby_49943bb6.wav",
      text: "This is the lullaby.",
    },
  },
  [normalizeText("This is the lunchbox.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_lunchbox_ceff435b.wav",
      text: "This is the lunchbox.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_lunchbox_ceff435b.wav",
      text: "This is the lunchbox.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_lunchbox_ceff435b.wav",
      text: "This is the lunchbox.",
    },
  },
  [normalizeText("This is the milk.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_milk_f67e21bb.wav",
      text: "This is the milk.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_milk_f67e21bb.wav",
      text: "This is the milk.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_milk_f67e21bb.wav",
      text: "This is the milk.",
    },
  },
  [normalizeText("This is the mirror.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_mirror_bb5ebfe5.wav",
      text: "This is the mirror.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_mirror_bb5ebfe5.wav",
      text: "This is the mirror.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_mirror_bb5ebfe5.wav",
      text: "This is the mirror.",
    },
  },
  [normalizeText("This is the moon mobile.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_moon_mobile_9bd4278f.wav",
      text: "This is the moon mobile.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_moon_mobile_9bd4278f.wav",
      text: "This is the moon mobile.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_moon_mobile_9bd4278f.wav",
      text: "This is the moon mobile.",
    },
  },
  [normalizeText("This is the music.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_music_6ac13d95.wav",
      text: "This is the music.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_music_6ac13d95.wav",
      text: "This is the music.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_music_6ac13d95.wav",
      text: "This is the music.",
    },
  },
  [normalizeText("This is the napkin.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_teach_napkin_237892f2.wav",
      text: "This is the napkin.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_teach_napkin_237892f2.wav",
      text: "This is the napkin.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_teach_napkin_237892f2.wav",
      text: "This is the napkin.",
    },
  },
  [normalizeText("This is the night light.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_night_light_a1727242.wav",
      text: "This is the night light.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_night_light_a1727242.wav",
      text: "This is the night light.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_night_light_a1727242.wav",
      text: "This is the night light.",
    },
  },
  [normalizeText("This is the nightstand.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_nightstand_1a98cb74.wav",
      text: "This is the nightstand.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_nightstand_1a98cb74.wav",
      text: "This is the nightstand.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_nightstand_1a98cb74.wav",
      text: "This is the nightstand.",
    },
  },
  [normalizeText("This is the noodles.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_noodles_306ddcd7.wav",
      text: "This is the noodles.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_noodles_306ddcd7.wav",
      text: "This is the noodles.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_noodles_306ddcd7.wav",
      text: "This is the noodles.",
    },
  },
  [normalizeText("This is the notebook.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_notebook_3aca9082.wav",
      text: "This is the notebook.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_notebook_3aca9082.wav",
      text: "This is the notebook.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_notebook_3aca9082.wav",
      text: "This is the notebook.",
    },
  },
  [normalizeText("This is the page tab.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_page_tab_f172bfa0.wav",
      text: "This is the page tab.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_page_tab_f172bfa0.wav",
      text: "This is the page tab.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_page_tab_f172bfa0.wav",
      text: "This is the page tab.",
    },
  },
  [normalizeText("This is the pajamas.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_pajamas_41e9660a.wav",
      text: "This is the pajamas.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_pajamas_41e9660a.wav",
      text: "This is the pajamas.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_pajamas_41e9660a.wav",
      text: "This is the pajamas.",
    },
  },
  [normalizeText("This is the paper.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_paper_428ad147.wav",
      text: "This is the paper.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_paper_428ad147.wav",
      text: "This is the paper.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_paper_428ad147.wav",
      text: "This is the paper.",
    },
  },
  [normalizeText("This is the pencil.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_pencil_283ce2d5.wav",
      text: "This is the pencil.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_pencil_283ce2d5.wav",
      text: "This is the pencil.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_pencil_283ce2d5.wav",
      text: "This is the pencil.",
    },
  },
  [normalizeText("This is the pillow.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_pillow_7da0c07c.wav",
      text: "This is the pillow.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_pillow_7da0c07c.wav",
      text: "This is the pillow.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_pillow_7da0c07c.wav",
      text: "This is the pillow.",
    },
  },
  [normalizeText("This is the placemat.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_placemat_cec7fe52.wav",
      text: "This is the placemat.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_placemat_cec7fe52.wav",
      text: "This is the placemat.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_placemat_cec7fe52.wav",
      text: "This is the placemat.",
    },
  },
  [normalizeText("This is the plate.")]: {
    "en-US": {
      key: "lessons/morning-routine/breakfast/audio/en-US/neural2-c-r1/prompt_teach_plate_b84396c6.wav",
      text: "This is the plate.",
    },
    "en-GB": {
      key: "lessons/morning-routine/breakfast/audio/en-GB/neural2-c-r1/prompt_teach_plate_b84396c6.wav",
      text: "This is the plate.",
    },
    legacy: {
      key: "lessons/morning-routine/breakfast/audio/en/prompt_teach_plate_b84396c6.wav",
      text: "This is the plate.",
    },
  },
  [normalizeText("This is the playground.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_playground_137a1414.wav",
      text: "This is the playground.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_playground_137a1414.wav",
      text: "This is the playground.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_playground_137a1414.wav",
      text: "This is the playground.",
    },
  },
  [normalizeText("This is the pot holder.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_pot_holder_3b31d74e.wav",
      text: "This is the pot holder.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_pot_holder_3b31d74e.wav",
      text: "This is the pot holder.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_pot_holder_3b31d74e.wav",
      text: "This is the pot holder.",
    },
  },
  [normalizeText("This is the puzzle.")]: {
    "en-US": {
      key: "lessons/home-play/creative-play/audio/en-US/neural2-c-r1/prompt_teach_puzzle_545b13a0.wav",
      text: "This is the puzzle.",
    },
    "en-GB": {
      key: "lessons/home-play/creative-play/audio/en-GB/neural2-c-r1/prompt_teach_puzzle_545b13a0.wav",
      text: "This is the puzzle.",
    },
    legacy: {
      key: "lessons/home-play/creative-play/audio/en/prompt_teach_puzzle_545b13a0.wav",
      text: "This is the puzzle.",
    },
  },
  [normalizeText("This is the raisins.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_raisins_2bcb0e60.wav",
      text: "This is the raisins.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_raisins_2bcb0e60.wav",
      text: "This is the raisins.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_raisins_2bcb0e60.wav",
      text: "This is the raisins.",
    },
  },
  [normalizeText("This is the reading nook.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_reading_nook_b2d9fad7.wav",
      text: "This is the reading nook.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_reading_nook_b2d9fad7.wav",
      text: "This is the reading nook.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_reading_nook_b2d9fad7.wav",
      text: "This is the reading nook.",
    },
  },
  [normalizeText("This is the recycling bin.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_recycling_bin_85fe070e.wav",
      text: "This is the recycling bin.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_recycling_bin_85fe070e.wav",
      text: "This is the recycling bin.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_recycling_bin_85fe070e.wav",
      text: "This is the recycling bin.",
    },
  },
  [normalizeText("This is the rice.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_rice_4f5af421.wav",
      text: "This is the rice.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_rice_4f5af421.wav",
      text: "This is the rice.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_rice_4f5af421.wav",
      text: "This is the rice.",
    },
  },
  [normalizeText("This is the road.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_road_f332e7e8.wav",
      text: "This is the road.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_road_f332e7e8.wav",
      text: "This is the road.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_road_f332e7e8.wav",
      text: "This is the road.",
    },
  },
  [normalizeText("This is the robe.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_robe_59ace8a6.wav",
      text: "This is the robe.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_robe_59ace8a6.wav",
      text: "This is the robe.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_robe_59ace8a6.wav",
      text: "This is the robe.",
    },
  },
  [normalizeText("This is the rope.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_rope_f4dc6a92.wav",
      text: "This is the rope.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_rope_f4dc6a92.wav",
      text: "This is the rope.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_rope_f4dc6a92.wav",
      text: "This is the rope.",
    },
  },
  [normalizeText("This is the rubber gloves.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_rubber_gloves_c2f20138.wav",
      text: "This is the rubber gloves.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_rubber_gloves_c2f20138.wav",
      text: "This is the rubber gloves.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_rubber_gloves_c2f20138.wav",
      text: "This is the rubber gloves.",
    },
  },
  [normalizeText("This is the ruler.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_teach_ruler_611af271.wav",
      text: "This is the ruler.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_teach_ruler_611af271.wav",
      text: "This is the ruler.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_teach_ruler_611af271.wav",
      text: "This is the ruler.",
    },
  },
  [normalizeText("This is the salad.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_salad_3703cad1.wav",
      text: "This is the salad.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_salad_3703cad1.wav",
      text: "This is the salad.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_salad_3703cad1.wav",
      text: "This is the salad.",
    },
  },
  [normalizeText("This is the sandbox.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_sandbox_8a7013b7.wav",
      text: "This is the sandbox.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_sandbox_8a7013b7.wav",
      text: "This is the sandbox.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_sandbox_8a7013b7.wav",
      text: "This is the sandbox.",
    },
  },
  [normalizeText("This is the sauce.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_sauce_cf432f96.wav",
      text: "This is the sauce.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_sauce_cf432f96.wav",
      text: "This is the sauce.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_sauce_cf432f96.wav",
      text: "This is the sauce.",
    },
  },
  [normalizeText("This is the scraper.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_scraper_5795f6cc.wav",
      text: "This is the scraper.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_scraper_5795f6cc.wav",
      text: "This is the scraper.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_scraper_5795f6cc.wav",
      text: "This is the scraper.",
    },
  },
  [normalizeText("This is the seat belt.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_seat_belt_5dda843a.wav",
      text: "This is the seat belt.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_seat_belt_5dda843a.wav",
      text: "This is the seat belt.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_seat_belt_5dda843a.wav",
      text: "This is the seat belt.",
    },
  },
  [normalizeText("This is the seesaw.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_seesaw_98f98d17.wav",
      text: "This is the seesaw.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_seesaw_98f98d17.wav",
      text: "This is the seesaw.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_seesaw_98f98d17.wav",
      text: "This is the seesaw.",
    },
  },
  [normalizeText("This is the serving cart.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_serving_cart_8ec96e55.wav",
      text: "This is the serving cart.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_serving_cart_8ec96e55.wav",
      text: "This is the serving cart.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_serving_cart_8ec96e55.wav",
      text: "This is the serving cart.",
    },
  },
  [normalizeText("This is the serving tray.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-prep/audio/en-US/neural2-c-r1/prompt_teach_serving_tray_33dd2ab1.wav",
      text: "This is the serving tray.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-prep/audio/en-GB/neural2-c-r1/prompt_teach_serving_tray_33dd2ab1.wav",
      text: "This is the serving tray.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-prep/audio/en/prompt_teach_serving_tray_33dd2ab1.wav",
      text: "This is the serving tray.",
    },
  },
  [normalizeText("This is the shade.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_shade_09bcc536.wav",
      text: "This is the shade.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_shade_09bcc536.wav",
      text: "This is the shade.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_shade_09bcc536.wav",
      text: "This is the shade.",
    },
  },
  [normalizeText("This is the shampoo.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_shampoo_34e7b8cd.wav",
      text: "This is the shampoo.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_shampoo_34e7b8cd.wav",
      text: "This is the shampoo.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_shampoo_34e7b8cd.wav",
      text: "This is the shampoo.",
    },
  },
  [normalizeText("This is the shelf.")]: {
    "en-US": {
      key: "lessons/afternoon-home/home-arrival/audio/en-US/neural2-c-r1/prompt_teach_shelf_035d8f3e.wav",
      text: "This is the shelf.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/home-arrival/audio/en-GB/neural2-c-r1/prompt_teach_shelf_035d8f3e.wav",
      text: "This is the shelf.",
    },
    legacy: {
      key: "lessons/afternoon-home/home-arrival/audio/en/prompt_teach_shelf_035d8f3e.wav",
      text: "This is the shelf.",
    },
  },
  [normalizeText("This is the shoes.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_shoes_404b4bd7.wav",
      text: "This is the shoes.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_shoes_404b4bd7.wav",
      text: "This is the shoes.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_shoes_404b4bd7.wav",
      text: "This is the shoes.",
    },
  },
  [normalizeText("This is the shoulder.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_shoulder_3e3b5314.wav",
      text: "This is the shoulder.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_shoulder_3e3b5314.wav",
      text: "This is the shoulder.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_shoulder_3e3b5314.wav",
      text: "This is the shoulder.",
    },
  },
  [normalizeText("This is the shower head.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_teach_shower_head_8855ed46.wav",
      text: "This is the shower head.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_teach_shower_head_8855ed46.wav",
      text: "This is the shower head.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_teach_shower_head_8855ed46.wav",
      text: "This is the shower head.",
    },
  },
  [normalizeText("This is the shower.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_teach_shower_951dde92.wav",
      text: "This is the shower.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_teach_shower_951dde92.wav",
      text: "This is the shower.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_teach_shower_951dde92.wav",
      text: "This is the shower.",
    },
  },
  [normalizeText("This is the sink.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_sink_3a64e545.wav",
      text: "This is the sink.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_sink_3a64e545.wav",
      text: "This is the sink.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_sink_3a64e545.wav",
      text: "This is the sink.",
    },
  },
  [normalizeText("This is the sleep mask.")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/prompt_teach_sleep_mask_f68a6210.wav",
      text: "This is the sleep mask.",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/prompt_teach_sleep_mask_f68a6210.wav",
      text: "This is the sleep mask.",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/prompt_teach_sleep_mask_f68a6210.wav",
      text: "This is the sleep mask.",
    },
  },
  [normalizeText("This is the slide.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_slide_19177b69.wav",
      text: "This is the slide.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_slide_19177b69.wav",
      text: "This is the slide.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_slide_19177b69.wav",
      text: "This is the slide.",
    },
  },
  [normalizeText("This is the slippers.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-US/neural2-c-r1/prompt_teach_slippers_41247301.wav",
      text: "This is the slippers.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-finish/audio/en-GB/neural2-c-r1/prompt_teach_slippers_41247301.wav",
      text: "This is the slippers.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-finish/audio/en/prompt_teach_slippers_41247301.wav",
      text: "This is the slippers.",
    },
  },
  [normalizeText("This is the small table.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_teach_small_table_afd1e371.wav",
      text: "This is the small table.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_teach_small_table_afd1e371.wav",
      text: "This is the small table.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_teach_small_table_afd1e371.wav",
      text: "This is the small table.",
    },
  },
  [normalizeText("This is the snack box.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_snack_box_472517e5.wav",
      text: "This is the snack box.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_snack_box_472517e5.wav",
      text: "This is the snack box.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_snack_box_472517e5.wav",
      text: "This is the snack box.",
    },
  },
  [normalizeText("This is the snack.")]: {
    "en-US": {
      key: "lessons/playtime/playtime-rest/audio/en-US/neural2-c-r1/prompt_rest_teach_snack_6c9a8c92.wav",
      text: "This is the snack.",
    },
    "en-GB": {
      key: "lessons/playtime/playtime-rest/audio/en-GB/neural2-c-r1/prompt_rest_teach_snack_6c9a8c92.wav",
      text: "This is the snack.",
    },
    legacy: {
      key: "lessons/playtime/playtime-rest/audio/en/prompt_rest_teach_snack_6c9a8c92.wav",
      text: "This is the snack.",
    },
  },
  [normalizeText("This is the soap.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_soap_18ead48a.wav",
      text: "This is the soap.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_soap_18ead48a.wav",
      text: "This is the soap.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_soap_18ead48a.wav",
      text: "This is the soap.",
    },
  },
  [normalizeText("This is the socks.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_socks_f6ba2b2a.wav",
      text: "This is the socks.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_socks_f6ba2b2a.wav",
      text: "This is the socks.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_socks_f6ba2b2a.wav",
      text: "This is the socks.",
    },
  },
  [normalizeText("This is the sound machine.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_sound_machine_62f26426.wav",
      text: "This is the sound machine.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_sound_machine_62f26426.wav",
      text: "This is the sound machine.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_sound_machine_62f26426.wav",
      text: "This is the sound machine.",
    },
  },
  [normalizeText("This is the soup.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_soup_0e3b76e3.wav",
      text: "This is the soup.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_soup_0e3b76e3.wav",
      text: "This is the soup.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_soup_0e3b76e3.wav",
      text: "This is the soup.",
    },
  },
  [normalizeText("This is the spill.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_spill_b8002ae5.wav",
      text: "This is the spill.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_spill_b8002ae5.wav",
      text: "This is the spill.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_spill_b8002ae5.wav",
      text: "This is the spill.",
    },
  },
  [normalizeText("This is the spoon.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_teach_spoon_0fab08fd.wav",
      text: "This is the spoon.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_teach_spoon_0fab08fd.wav",
      text: "This is the spoon.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_teach_spoon_0fab08fd.wav",
      text: "This is the spoon.",
    },
  },
  [normalizeText("This is the spray bottle.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_spray_bottle_a6cff77a.wav",
      text: "This is the spray bottle.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_spray_bottle_a6cff77a.wav",
      text: "This is the spray bottle.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_spray_bottle_a6cff77a.wav",
      text: "This is the spray bottle.",
    },
  },
  [normalizeText("This is the stain.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-US/neural2-c-r1/prompt_teach_stain_f5fb434c.wav",
      text: "This is the stain.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en-GB/neural2-c-r1/prompt_teach_stain_f5fb434c.wav",
      text: "This is the stain.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/spot-clean/audio/en/prompt_teach_stain_f5fb434c.wav",
      text: "This is the stain.",
    },
  },
  [normalizeText("This is the star projector.")]: {
    "en-US": {
      key: "lessons/bedtime/calm-room/audio/en-US/neural2-c-r1/prompt_teach_star_projector_4d16d562.wav",
      text: "This is the star projector.",
    },
    "en-GB": {
      key: "lessons/bedtime/calm-room/audio/en-GB/neural2-c-r1/prompt_teach_star_projector_4d16d562.wav",
      text: "This is the star projector.",
    },
    legacy: {
      key: "lessons/bedtime/calm-room/audio/en/prompt_teach_star_projector_4d16d562.wav",
      text: "This is the star projector.",
    },
  },
  [normalizeText("This is the story shelf.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_story_shelf_85642c7d.wav",
      text: "This is the story shelf.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_story_shelf_85642c7d.wav",
      text: "This is the story shelf.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_story_shelf_85642c7d.wav",
      text: "This is the story shelf.",
    },
  },
  [normalizeText("This is the storybook.")]: {
    "en-US": {
      key: "lessons/bedtime/bedtime-story/audio/en-US/neural2-c-r1/prompt_teach_storybook_5c1fa0e4.wav",
      text: "This is the storybook.",
    },
    "en-GB": {
      key: "lessons/bedtime/bedtime-story/audio/en-GB/neural2-c-r1/prompt_teach_storybook_5c1fa0e4.wav",
      text: "This is the storybook.",
    },
    legacy: {
      key: "lessons/bedtime/bedtime-story/audio/en/prompt_teach_storybook_5c1fa0e4.wav",
      text: "This is the storybook.",
    },
  },
  [normalizeText("This is the straw.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_straw_3960f7b5.wav",
      text: "This is the straw.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_straw_3960f7b5.wav",
      text: "This is the straw.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_straw_3960f7b5.wav",
      text: "This is the straw.",
    },
  },
  [normalizeText("This is the sun.")]: {
    "en-US": {
      key: "lessons/morning-routine/bedroom/audio/en-US/neural2-c-r1/prompt_teach_sun_f7295391.wav",
      text: "This is the sun.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bedroom/audio/en-GB/neural2-c-r1/prompt_teach_sun_f7295391.wav",
      text: "This is the sun.",
    },
    legacy: {
      key: "lessons/morning-routine/bedroom/audio/en/prompt_teach_sun_f7295391.wav",
      text: "This is the sun.",
    },
  },
  [normalizeText("This is the swing.")]: {
    "en-US": {
      key: "lessons/playtime/playground/audio/en-US/neural2-c-r1/prompt_teach_swing_e8ec85b4.wav",
      text: "This is the swing.",
    },
    "en-GB": {
      key: "lessons/playtime/playground/audio/en-GB/neural2-c-r1/prompt_teach_swing_e8ec85b4.wav",
      text: "This is the swing.",
    },
    legacy: {
      key: "lessons/playtime/playground/audio/en/prompt_teach_swing_e8ec85b4.wav",
      text: "This is the swing.",
    },
  },
  [normalizeText("This is the table.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-table/audio/en-US/neural2-c-r1/prompt_lunchtable_teach_table_1c55824b.wav",
      text: "This is the table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-table/audio/en-GB/neural2-c-r1/prompt_lunchtable_teach_table_1c55824b.wav",
      text: "This is the table.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-table/audio/en/prompt_lunchtable_teach_table_1c55824b.wav",
      text: "This is the table.",
    },
  },
  [normalizeText("This is the teacher.")]: {
    "en-US": {
      key: "lessons/at-school/classroom/audio/en-US/neural2-c-r1/prompt_teach_teacher_ae0784a1.wav",
      text: "This is the teacher.",
    },
    "en-GB": {
      key: "lessons/at-school/classroom/audio/en-GB/neural2-c-r1/prompt_teach_teacher_ae0784a1.wav",
      text: "This is the teacher.",
    },
    legacy: {
      key: "lessons/at-school/classroom/audio/en/prompt_teach_teacher_ae0784a1.wav",
      text: "This is the teacher.",
    },
  },
  [normalizeText("This is the timer.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/prompt_teach_timer_b0a39a27.wav",
      text: "This is the timer.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/prompt_teach_timer_b0a39a27.wav",
      text: "This is the timer.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/prompt_teach_timer_b0a39a27.wav",
      text: "This is the timer.",
    },
  },
  [normalizeText("This is the tongs.")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/prompt_teach_tongs_0837f9e0.wav",
      text: "This is the tongs.",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/prompt_teach_tongs_0837f9e0.wav",
      text: "This is the tongs.",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/prompt_teach_tongs_0837f9e0.wav",
      text: "This is the tongs.",
    },
  },
  [normalizeText("This is the toothbrush.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_toothbrush_6e0951e3.wav",
      text: "This is the toothbrush.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_toothbrush_6e0951e3.wav",
      text: "This is the toothbrush.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_toothbrush_6e0951e3.wav",
      text: "This is the toothbrush.",
    },
  },
  [normalizeText("This is the toothpaste.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_toothpaste_7dff07f8.wav",
      text: "This is the toothpaste.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_toothpaste_7dff07f8.wav",
      text: "This is the toothpaste.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_toothpaste_7dff07f8.wav",
      text: "This is the toothpaste.",
    },
  },
  [normalizeText("This is the towel.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_towel_1ebcc544.wav",
      text: "This is the towel.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_towel_1ebcc544.wav",
      text: "This is the towel.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_towel_1ebcc544.wav",
      text: "This is the towel.",
    },
  },
  [normalizeText("This is the toy.")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/prompt_games_teach_toy_e28fd1f6.wav",
      text: "This is the toy.",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/prompt_games_teach_toy_e28fd1f6.wav",
      text: "This is the toy.",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/prompt_games_teach_toy_e28fd1f6.wav",
      text: "This is the toy.",
    },
  },
  [normalizeText("This is the traffic light.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_traffic_light_c4f61713.wav",
      text: "This is the traffic light.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_traffic_light_c4f61713.wav",
      text: "This is the traffic light.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_traffic_light_c4f61713.wav",
      text: "This is the traffic light.",
    },
  },
  [normalizeText("This is the trash bin.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_teach_trash_bin_14bc2bf4.wav",
      text: "This is the trash bin.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_teach_trash_bin_14bc2bf4.wav",
      text: "This is the trash bin.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_teach_trash_bin_14bc2bf4.wav",
      text: "This is the trash bin.",
    },
  },
  [normalizeText("This is the tray.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_teach_tray_a315abcf.wav",
      text: "This is the tray.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_tray_a315abcf.wav",
      text: "This is the tray.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_teach_tray_a315abcf.wav",
      text: "This is the tray.",
    },
  },
  [normalizeText("This is the uniform.")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/prompt_school_teach_uniform_d187ecf2.wav",
      text: "This is the uniform.",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/prompt_school_teach_uniform_d187ecf2.wav",
      text: "This is the uniform.",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/prompt_school_teach_uniform_d187ecf2.wav",
      text: "This is the uniform.",
    },
  },
  [normalizeText("This is the vegetables.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_teach_vegetables_8e9d37e2.wav",
      text: "This is the vegetables.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_teach_vegetables_8e9d37e2.wav",
      text: "This is the vegetables.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_teach_vegetables_8e9d37e2.wav",
      text: "This is the vegetables.",
    },
  },
  [normalizeText("This is the water.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_teach_water_b01e4737.wav",
      text: "This is the water.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_teach_water_b01e4737.wav",
      text: "This is the water.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_teach_water_b01e4737.wav",
      text: "This is the water.",
    },
  },
  [normalizeText("This is the window.")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/prompt_teach_window_6fd60735.wav",
      text: "This is the window.",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/prompt_teach_window_6fd60735.wav",
      text: "This is the window.",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/prompt_teach_window_6fd60735.wav",
      text: "This is the window.",
    },
  },
  [normalizeText("This is the wrapper.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_teach_wrapper_dc32ed03.wav",
      text: "This is the wrapper.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_teach_wrapper_dc32ed03.wav",
      text: "This is the wrapper.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_teach_wrapper_dc32ed03.wav",
      text: "This is the wrapper.",
    },
  },
  [normalizeText("This is the yogurt.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/prompt_teach_yogurt_d11644db.wav",
      text: "This is the yogurt.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/prompt_teach_yogurt_d11644db.wav",
      text: "This is the yogurt.",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/prompt_teach_yogurt_d11644db.wav",
      text: "This is the yogurt.",
    },
  },
  [normalizeText("throw away wrapper")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/throw_away_wrapper.wav",
      text: "throw away wrapper",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/throw_away_wrapper.wav",
      text: "throw away wrapper",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/throw_away_wrapper.wav",
      text: "throw away wrapper",
    },
  },
  [normalizeText("Throw away wrapper.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/prompt_drag_wrapper_away_447c2904.wav",
      text: "Throw away wrapper.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_wrapper_away_447c2904.wav",
      text: "Throw away wrapper.",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/prompt_drag_wrapper_away_447c2904.wav",
      text: "Throw away wrapper.",
    },
  },
  [normalizeText("tidy room")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/tidy_room.wav",
      text: "tidy room",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/tidy_room.wav",
      text: "tidy room",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/tidy_room.wav",
      text: "tidy room",
    },
  },
  [normalizeText("Tidy room.")]: {
    "en-US": {
      key: "lessons/home-play/toy-cleanup/audio/en-US/neural2-c-r1/prompt_drag_basket_to_shelf_ba784c4c.wav",
      text: "Tidy room.",
    },
    "en-GB": {
      key: "lessons/home-play/toy-cleanup/audio/en-GB/neural2-c-r1/prompt_drag_basket_to_shelf_ba784c4c.wav",
      text: "Tidy room.",
    },
    legacy: {
      key: "lessons/home-play/toy-cleanup/audio/en/prompt_drag_basket_to_shelf_ba784c4c.wav",
      text: "Tidy room.",
    },
  },
  [normalizeText("timer")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-US/neural2-c-r1/timer.wav",
      text: "timer",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en-GB/neural2-c-r1/timer.wav",
      text: "timer",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/sort-and-dry/audio/en/timer.wav",
      text: "timer",
    },
  },
  [normalizeText("tongs")]: {
    "en-US": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-US/neural2-c-r1/tongs.wav",
      text: "tongs",
    },
    "en-GB": {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en-GB/neural2-c-r1/tongs.wav",
      text: "tongs",
    },
    legacy: {
      key: "lessons/after-dinner-cleanup/clear-dinner/audio/en/tongs.wav",
      text: "tongs",
    },
  },
  [normalizeText("toothbrush")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/toothbrush.wav",
      text: "toothbrush",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/toothbrush.wav",
      text: "toothbrush",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/toothbrush.wav",
      text: "toothbrush",
    },
  },
  [normalizeText("toothpaste")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/toothpaste.wav",
      text: "toothpaste",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/toothpaste.wav",
      text: "toothpaste",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/toothpaste.wav",
      text: "toothpaste",
    },
  },
  [normalizeText("towel")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/towel.wav",
      text: "towel",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/towel.wav",
      text: "towel",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/towel.wav",
      text: "towel",
    },
  },
  [normalizeText("toy")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/toy.wav",
      text: "toy",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/toy.wav",
      text: "toy",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/toy.wav",
      text: "toy",
    },
  },
  [normalizeText("Toy Corner is complete.")]: {
    "en-US": {
      key: "lessons/home-play/home-toy-corner/audio/en-US/neural2-c-r1/completion_db179489.wav",
      text: "Toy Corner is complete.",
    },
    "en-GB": {
      key: "lessons/home-play/home-toy-corner/audio/en-GB/neural2-c-r1/completion_db179489.wav",
      text: "Toy Corner is complete.",
    },
    legacy: {
      key: "lessons/home-play/home-toy-corner/audio/en/completion_db179489.wav",
      text: "Toy Corner is complete.",
    },
  },
  [normalizeText("traffic light")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/traffic_light.wav",
      text: "traffic light",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/traffic_light.wav",
      text: "traffic light",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/traffic_light.wav",
      text: "traffic light",
    },
  },
  [normalizeText("trash bin")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/trash_bin.wav",
      text: "trash bin",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/trash_bin.wav",
      text: "trash bin",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/trash_bin.wav",
      text: "trash bin",
    },
  },
  [normalizeText("tray")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/tray.wav",
      text: "tray",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/tray.wav",
      text: "tray",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/tray.wav",
      text: "tray",
    },
  },
  [normalizeText("Try again.")]: {
    "en-US": {
      key: "shared/audio/en-US/neural2-c-r1/feedback_fail_9c3fc2eb.wav",
      text: "Try again.",
    },
    "en-GB": {
      key: "shared/audio/en-GB/neural2-c-r1/feedback_fail_9c3fc2eb.wav",
      text: "Try again.",
    },
    legacy: {
      key: "shared/audio/en/feedback_fail_9c3fc2eb.wav",
      text: "Try again.",
    },
  },
  [normalizeText("try vegetables")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/try_vegetables.wav",
      text: "try vegetables",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/try_vegetables.wav",
      text: "try vegetables",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/try_vegetables.wav",
      text: "try vegetables",
    },
  },
  [normalizeText("Try vegetables.")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/prompt_drag_vegetables_to_child_c938105f.wav",
      text: "Try vegetables.",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/prompt_drag_vegetables_to_child_c938105f.wav",
      text: "Try vegetables.",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/prompt_drag_vegetables_to_child_c938105f.wav",
      text: "Try vegetables.",
    },
  },
  [normalizeText("turn on shower")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/turn_on_shower.wav",
      text: "turn on shower",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/turn_on_shower.wav",
      text: "turn on shower",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/turn_on_shower.wav",
      text: "turn on shower",
    },
  },
  [normalizeText("Turn on shower.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-US/neural2-c-r1/prompt_tap_turn_on_shower_7f77e911.wav",
      text: "Turn on shower.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-prep/audio/en-GB/neural2-c-r1/prompt_tap_turn_on_shower_7f77e911.wav",
      text: "Turn on shower.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-prep/audio/en/prompt_tap_turn_on_shower_7f77e911.wav",
      text: "Turn on shower.",
    },
  },
  [normalizeText("uniform")]: {
    "en-US": {
      key: "lessons/morning-routine/go-to-school/audio/en-US/neural2-c-r1/uniform.wav",
      text: "uniform",
    },
    "en-GB": {
      key: "lessons/morning-routine/go-to-school/audio/en-GB/neural2-c-r1/uniform.wav",
      text: "uniform",
    },
    legacy: {
      key: "lessons/morning-routine/go-to-school/audio/en/uniform.wav",
      text: "uniform",
    },
  },
  [normalizeText("use spoon")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/use_spoon.wav",
      text: "use spoon",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/use_spoon.wav",
      text: "use spoon",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/use_spoon.wav",
      text: "use spoon",
    },
  },
  [normalizeText("Use spoon.")]: {
    "en-US": {
      key: "lessons/lunch-time/lunch-box/audio/en-US/neural2-c-r1/prompt_lunchbox_drag_spoon_to_mouth_580e14d4.wav",
      text: "Use spoon.",
    },
    "en-GB": {
      key: "lessons/lunch-time/lunch-box/audio/en-GB/neural2-c-r1/prompt_lunchbox_drag_spoon_to_mouth_580e14d4.wav",
      text: "Use spoon.",
    },
    legacy: {
      key: "lessons/lunch-time/lunch-box/audio/en/prompt_lunchbox_drag_spoon_to_mouth_580e14d4.wav",
      text: "Use spoon.",
    },
  },
  [normalizeText("vegetables")]: {
    "en-US": {
      key: "lessons/family-dinner/dinner-table/audio/en-US/neural2-c-r1/vegetables.wav",
      text: "vegetables",
    },
    "en-GB": {
      key: "lessons/family-dinner/dinner-table/audio/en-GB/neural2-c-r1/vegetables.wav",
      text: "vegetables",
    },
    legacy: {
      key: "lessons/family-dinner/dinner-table/audio/en/vegetables.wav",
      text: "vegetables",
    },
  },
  [normalizeText("wait")]: {
    "en-US": {
      key: "lessons/playtime/friend-games/audio/en-US/neural2-c-r1/wait.wav",
      text: "wait",
    },
    "en-GB": {
      key: "lessons/playtime/friend-games/audio/en-GB/neural2-c-r1/wait.wav",
      text: "wait",
    },
    legacy: {
      key: "lessons/playtime/friend-games/audio/en/wait.wav",
      text: "wait",
    },
  },
  [normalizeText("Wash and rinse!")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/prompt_intro_05ccd00c.wav",
      text: "Wash and rinse!",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/prompt_intro_05ccd00c.wav",
      text: "Wash and rinse!",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/prompt_intro_05ccd00c.wav",
      text: "Wash and rinse!",
    },
  },
  [normalizeText("wash face")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/wash_face.wav",
      text: "wash face",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/wash_face.wav",
      text: "wash face",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/wash_face.wav",
      text: "wash face",
    },
  },
  [normalizeText("Wash face.")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/prompt_drag_water_to_face_dd93544f.wav",
      text: "Wash face.",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/prompt_drag_water_to_face_dd93544f.wav",
      text: "Wash face.",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/prompt_drag_water_to_face_dd93544f.wav",
      text: "Wash face.",
    },
  },
  [normalizeText("wash hands")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/wash_hands.wav",
      text: "wash hands",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/wash_hands.wav",
      text: "wash hands",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/wash_hands.wav",
      text: "wash hands",
    },
  },
  [normalizeText("Wash hands.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_drag_soap_to_hands_f19bda6d.wav",
      text: "Wash hands.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_drag_soap_to_hands_f19bda6d.wav",
      text: "Wash hands.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_drag_soap_to_hands_f19bda6d.wav",
      text: "Wash hands.",
    },
  },
  [normalizeText("Washing and Rinsing is complete.")]: {
    "en-US": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-US/neural2-c-r1/completion_76cb7208.wav",
      text: "Washing and Rinsing is complete.",
    },
    "en-GB": {
      key: "lessons/afternoon-bath/bath-rinse/audio/en-GB/neural2-c-r1/completion_76cb7208.wav",
      text: "Washing and Rinsing is complete.",
    },
    legacy: {
      key: "lessons/afternoon-bath/bath-rinse/audio/en/completion_76cb7208.wav",
      text: "Washing and Rinsing is complete.",
    },
  },
  [normalizeText("water")]: {
    "en-US": {
      key: "lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/water.wav",
      text: "water",
    },
    "en-GB": {
      key: "lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/water.wav",
      text: "water",
    },
    legacy: {
      key: "lessons/morning-routine/bathroom/audio/en/water.wav",
      text: "water",
    },
  },
  [normalizeText("wear sleep mask")]: {
    "en-US": {
      key: "lessons/bedtime/sleep-ready/audio/en-US/neural2-c-r1/wear_sleep_mask.wav",
      text: "wear sleep mask",
    },
    "en-GB": {
      key: "lessons/bedtime/sleep-ready/audio/en-GB/neural2-c-r1/wear_sleep_mask.wav",
      text: "wear sleep mask",
    },
    legacy: {
      key: "lessons/bedtime/sleep-ready/audio/en/wear_sleep_mask.wav",
      text: "wear sleep mask",
    },
  },
  [normalizeText("window")]: {
    "en-US": {
      key: "lessons/afternoon-home/ride-home/audio/en-US/neural2-c-r1/window.wav",
      text: "window",
    },
    "en-GB": {
      key: "lessons/afternoon-home/ride-home/audio/en-GB/neural2-c-r1/window.wav",
      text: "window",
    },
    legacy: {
      key: "lessons/afternoon-home/ride-home/audio/en/window.wav",
      text: "window",
    },
  },
  [normalizeText("wipe mouth")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/wipe_mouth.wav",
      text: "wipe mouth",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/wipe_mouth.wav",
      text: "wipe mouth",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/wipe_mouth.wav",
      text: "wipe mouth",
    },
  },
  [normalizeText("Wipe mouth.")]: {
    "en-US": {
      key: "lessons/snack-time/snack-table/audio/en-US/neural2-c-r1/prompt_drag_napkin_to_mouth_b5a16748.wav",
      text: "Wipe mouth.",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-table/audio/en-GB/neural2-c-r1/prompt_drag_napkin_to_mouth_b5a16748.wav",
      text: "Wipe mouth.",
    },
    legacy: {
      key: "lessons/snack-time/snack-table/audio/en/prompt_drag_napkin_to_mouth_b5a16748.wav",
      text: "Wipe mouth.",
    },
  },
  [normalizeText("wipe table")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/wipe_table.wav",
      text: "wipe table",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/wipe_table.wav",
      text: "wipe table",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/wipe_table.wav",
      text: "wipe table",
    },
  },
  [normalizeText("Wipe table.")]: {
    "en-US": {
      key: "lessons/lunch-time/after-lunch/audio/en-US/neural2-c-r1/prompt_cleanup_drag_towel_to_table_ebf11bdd.wav",
      text: "Wipe table.",
    },
    "en-GB": {
      key: "lessons/lunch-time/after-lunch/audio/en-GB/neural2-c-r1/prompt_cleanup_drag_towel_to_table_ebf11bdd.wav",
      text: "Wipe table.",
    },
    legacy: {
      key: "lessons/lunch-time/after-lunch/audio/en/prompt_cleanup_drag_towel_to_table_ebf11bdd.wav",
      text: "Wipe table.",
    },
  },
  [normalizeText("wrapper")]: {
    "en-US": {
      key: "lessons/snack-time/snack-cleanup/audio/en-US/neural2-c-r1/wrapper.wav",
      text: "wrapper",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-cleanup/audio/en-GB/neural2-c-r1/wrapper.wav",
      text: "wrapper",
    },
    legacy: {
      key: "lessons/snack-time/snack-cleanup/audio/en/wrapper.wav",
      text: "wrapper",
    },
  },
  [normalizeText("write your name")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/write_your_name.wav",
      text: "write your name",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/write_your_name.wav",
      text: "write your name",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/write_your_name.wav",
      text: "write your name",
    },
  },
  [normalizeText("Write your name.")]: {
    "en-US": {
      key: "lessons/at-school/school-supplies/audio/en-US/neural2-c-r1/prompt_supplies_drag_pencil_to_paper_46016132.wav",
      text: "Write your name.",
    },
    "en-GB": {
      key: "lessons/at-school/school-supplies/audio/en-GB/neural2-c-r1/prompt_supplies_drag_pencil_to_paper_46016132.wav",
      text: "Write your name.",
    },
    legacy: {
      key: "lessons/at-school/school-supplies/audio/en/prompt_supplies_drag_pencil_to_paper_46016132.wav",
      text: "Write your name.",
    },
  },
  [normalizeText("yogurt")]: {
    "en-US": {
      key: "lessons/snack-time/snack-prep/audio/en-US/neural2-c-r1/yogurt.wav",
      text: "yogurt",
    },
    "en-GB": {
      key: "lessons/snack-time/snack-prep/audio/en-GB/neural2-c-r1/yogurt.wav",
      text: "yogurt",
    },
    legacy: {
      key: "lessons/snack-time/snack-prep/audio/en/yogurt.wav",
      text: "yogurt",
    },
  },
};

const viAudioByText: Record<string, RemoteAudioAsset> = {
  [normalizeText("Bé đã gom đồ sau bữa tối thật gọn!")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/completion_f5016958.wav",
    text: "Bé đã gom đồ sau bữa tối thật gọn!",
  },
  [normalizeText("Đặt bình rót lên xe đẩy đồ ăn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_carafe_to_cart_c99b096c.wav",
    text: "Đặt bình rót lên xe đẩy đồ ăn.",
  },
  [normalizeText("Kéo bình rót tới xe đẩy đồ ăn nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_carafe_to_cart_fail_f39ac200.wav",
    text: "Kéo bình rót tới xe đẩy đồ ăn nhé.",
  },
  [normalizeText("Bình rót đã ở trên xe đẩy.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_carafe_to_cart_success_4a903fb8.wav",
    text: "Bình rót đã ở trên xe đẩy.",
  },
  [normalizeText("Đặt miếng lót ly lên xe đẩy đồ ăn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_coaster_to_cart_0114a518.wav",
    text: "Đặt miếng lót ly lên xe đẩy đồ ăn.",
  },
  [normalizeText("Kéo miếng lót ly tới xe đẩy đồ ăn nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_coaster_to_cart_fail_7bbc2e96.wav",
    text: "Kéo miếng lót ly tới xe đẩy đồ ăn nhé.",
  },
  [normalizeText("Miếng lót ly đã nằm trên xe đẩy.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_coaster_to_cart_success_05333af1.wav",
    text: "Miếng lót ly đã nằm trên xe đẩy.",
  },
  [normalizeText("Dán nhãn lên hộp nhỏ.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_label_to_container_bc8b3d3d.wav",
    text: "Dán nhãn lên hộp nhỏ.",
  },
  [normalizeText("Kéo nhãn dán tới hộp nhỏ nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_label_to_container_fail_b9364df8.wav",
    text: "Kéo nhãn dán tới hộp nhỏ nhé.",
  },
  [normalizeText("Hộp nhỏ đã có nhãn dán.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_label_to_container_success_d9fb1064.wav",
    text: "Hộp nhỏ đã có nhãn dán.",
  },
  [normalizeText("Đẩy xe đồ ăn về khu dọn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_move_cart_8d6d1b35.wav",
    text: "Đẩy xe đồ ăn về khu dọn.",
  },
  [normalizeText("Kéo xe đẩy vào vùng sáng nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_move_cart_fail_d504ea06.wav",
    text: "Kéo xe đẩy vào vùng sáng nhé.",
  },
  [normalizeText("Xe đồ ăn đã được đẩy gọn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_move_cart_success_a92b24bf.wav",
    text: "Xe đồ ăn đã được đẩy gọn.",
  },
  [normalizeText("Xếp miếng lót ly lại với nhau.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_stack_coasters_0ca660f0.wav",
    text: "Xếp miếng lót ly lại với nhau.",
  },
  [normalizeText("Kéo miếng lót ly tới xe đẩy để xếp lại nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_stack_coasters_fail_8d6123ea.wav",
    text: "Kéo miếng lót ly tới xe đẩy để xếp lại nhé.",
  },
  [normalizeText("Miếng lót ly đã được xếp gọn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/drag_stack_coasters_success_bc95a2cf.wav",
    text: "Miếng lót ly đã được xếp gọn.",
  },
  [normalizeText("Bữa tối xong rồi, mình gom đồ nhỏ nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/intro_987a277f.wav",
    text: "Bữa tối xong rồi, mình gom đồ nhỏ nhé.",
  },
  [normalizeText("Gom từng món nhỏ giúp khu ăn gọn hơn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/intro_success_e3271255.wav",
    text: "Gom từng món nhỏ giúp khu ăn gọn hơn.",
  },
  [normalizeText("Chạm vào miếng lót ly nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_coaster_590a1d63.wav",
    text: "Chạm vào miếng lót ly nhé.",
  },
  [normalizeText("Miếng lót ly nằm gần mép bàn đó.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_coaster_fail_447cbe61.wav",
    text: "Miếng lót ly nằm gần mép bàn đó.",
  },
  [normalizeText("Đúng rồi, đó là miếng lót ly.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_coaster_success_3b7b5a8e.wav",
    text: "Đúng rồi, đó là miếng lót ly.",
  },
  [normalizeText("Chạm vào nhãn dán nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_label_a613a67d.wav",
    text: "Chạm vào nhãn dán nhé.",
  },
  [normalizeText("Nhãn dán nằm phía trên hộp nhỏ đó.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_label_fail_6304e5ef.wav",
    text: "Nhãn dán nằm phía trên hộp nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là nhãn dán.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_label_success_cb38541d.wav",
    text: "Đúng rồi, đó là nhãn dán.",
  },
  [normalizeText("Chạm vào miếng nhấc nồi nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_pot_holder_933bbab9.wav",
    text: "Chạm vào miếng nhấc nồi nhé.",
  },
  [normalizeText("Miếng nhấc nồi nằm bên trái đó.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_pot_holder_fail_603451b1.wav",
    text: "Miếng nhấc nồi nằm bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là miếng nhấc nồi.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_pot_holder_success_bd230058.wav",
    text: "Đúng rồi, đó là miếng nhấc nồi.",
  },
  [normalizeText("Chạm vào kẹp gắp nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_tongs_571cd156.wav",
    text: "Chạm vào kẹp gắp nhé.",
  },
  [normalizeText("Kẹp gắp nằm ở góc bên phải đó.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_tongs_fail_14b6fb50.wav",
    text: "Kẹp gắp nằm ở góc bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là kẹp gắp.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/tap_tongs_success_e6bb8cb8.wav",
    text: "Đúng rồi, đó là kẹp gắp.",
  },
  [normalizeText("Đây là bình rót.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_carafe_d8dddf25.wav",
    text: "Đây là bình rót.",
  },
  [normalizeText("Từ này nghĩa là bình rót.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_carafe_success_51772b7d.wav",
    text: "Từ này nghĩa là bình rót.",
  },
  [normalizeText("Đây là miếng lót ly.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_coaster_95f5116c.wav",
    text: "Đây là miếng lót ly.",
  },
  [normalizeText("Từ này nghĩa là miếng lót ly.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_coaster_success_7bab6d5f.wav",
    text: "Từ này nghĩa là miếng lót ly.",
  },
  [normalizeText("Đây là nhãn dán.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_label_ae74ff0a.wav",
    text: "Đây là nhãn dán.",
  },
  [normalizeText("Mình học câu dán nhãn hộp nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_label_container_6936b55c.wav",
    text: "Mình học câu dán nhãn hộp nhé.",
  },
  [normalizeText("Dán nhãn giúp cả nhà biết trong hộp có gì.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_label_container_success_6f3db900.wav",
    text: "Dán nhãn giúp cả nhà biết trong hộp có gì.",
  },
  [normalizeText("Từ này nghĩa là nhãn dán.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_label_success_ff1f6f2b.wav",
    text: "Từ này nghĩa là nhãn dán.",
  },
  [normalizeText("Mình học câu đẩy xe đồ ăn nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_move_cart_340abf4a.wav",
    text: "Mình học câu đẩy xe đồ ăn nhé.",
  },
  [normalizeText("Đẩy xe đồ ăn giúp mang nhiều món cùng lúc.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_move_cart_success_89af47f2.wav",
    text: "Đẩy xe đồ ăn giúp mang nhiều món cùng lúc.",
  },
  [normalizeText("Đây là miếng nhấc nồi.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_pot_holder_1c91a7ac.wav",
    text: "Đây là miếng nhấc nồi.",
  },
  [normalizeText("Từ này nghĩa là miếng nhấc nồi.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_pot_holder_success_9be383b7.wav",
    text: "Từ này nghĩa là miếng nhấc nồi.",
  },
  [normalizeText("Đây là xe đẩy đồ ăn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_serving_cart_93cf9258.wav",
    text: "Đây là xe đẩy đồ ăn.",
  },
  [normalizeText("Từ này nghĩa là xe đẩy đồ ăn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_serving_cart_success_5af27846.wav",
    text: "Từ này nghĩa là xe đẩy đồ ăn.",
  },
  [normalizeText("Mình học câu xếp miếng lót ly nhé.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_stack_coasters_bdebe604.wav",
    text: "Mình học câu xếp miếng lót ly nhé.",
  },
  [normalizeText("Xếp miếng lót ly giúp bàn gọn nhanh hơn.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_stack_coasters_success_716339a5.wav",
    text: "Xếp miếng lót ly giúp bàn gọn nhanh hơn.",
  },
  [normalizeText("Đây là kẹp gắp.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_tongs_914dc3e7.wav",
    text: "Đây là kẹp gắp.",
  },
  [normalizeText("Từ này nghĩa là kẹp gắp.")]: {
    key: "lessons/after-dinner-cleanup/clear-dinner/audio/vi/teach_tongs_success_7b2ce519.wav",
    text: "Từ này nghĩa là kẹp gắp.",
  },
  [normalizeText("Bé đã phân loại và làm khô đồ sau bữa tối!")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/completion_f1384bba.wav",
    text: "Bé đã phân loại và làm khô đồ sau bữa tối!",
  },
  [normalizeText("Phân loại hộp giấy vào thùng tái chế.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_carton_to_recycling_b7555bc5.wav",
    text: "Phân loại hộp giấy vào thùng tái chế.",
  },
  [normalizeText("Kéo hộp giấy tới thùng tái chế nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_carton_to_recycling_fail_ab0f0448.wav",
    text: "Kéo hộp giấy tới thùng tái chế nhé.",
  },
  [normalizeText("Hộp giấy đã được phân loại.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_carton_to_recycling_success_8f097dbe.wav",
    text: "Hộp giấy đã được phân loại.",
  },
  [normalizeText("Để chén khô tự nhiên trên giá úp.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_dishes_to_rack_0113dfd8.wav",
    text: "Để chén khô tự nhiên trên giá úp.",
  },
  [normalizeText("Kéo chén tới giá úp chén nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_dishes_to_rack_fail_6fea9199.wav",
    text: "Kéo chén tới giá úp chén nhé.",
  },
  [normalizeText("Chén đã được để khô tự nhiên.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_dishes_to_rack_success_83e34189.wav",
    text: "Chén đã được để khô tự nhiên.",
  },
  [normalizeText("Đặt tấm thấm khô cạnh giá úp chén.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_drying_mat_5b2432be.wav",
    text: "Đặt tấm thấm khô cạnh giá úp chén.",
  },
  [normalizeText("Kéo tấm thấm khô tới cạnh giá úp chén nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_drying_mat_fail_2e821922.wav",
    text: "Kéo tấm thấm khô tới cạnh giá úp chén nhé.",
  },
  [normalizeText("Tấm thấm khô đã nằm đúng chỗ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/drag_drying_mat_success_bc3e8224.wav",
    text: "Tấm thấm khô đã nằm đúng chỗ.",
  },
  [normalizeText("Cuối cùng, mình phân loại và để đồ khô nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/intro_0c4a1f67.wav",
    text: "Cuối cùng, mình phân loại và để đồ khô nhé.",
  },
  [normalizeText("Phân loại đúng giúp khu bếp gọn và sạch hơn.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/intro_success_9913bf5f.wav",
    text: "Phân loại đúng giúp khu bếp gọn và sạch hơn.",
  },
  [normalizeText("Chạm vào tủ bếp nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_cabinet_b432e80e.wav",
    text: "Chạm vào tủ bếp nhé.",
  },
  [normalizeText("Tủ bếp nằm ở phía trên bên trái đó.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_cabinet_fail_f0fed9bb.wav",
    text: "Tủ bếp nằm ở phía trên bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là tủ bếp.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_cabinet_success_f269b052.wav",
    text: "Đúng rồi, đó là tủ bếp.",
  },
  [normalizeText("Chạm vào thùng ủ rác hữu cơ nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_compost_bin_ef8feeff.wav",
    text: "Chạm vào thùng ủ rác hữu cơ nhé.",
  },
  [normalizeText("Thùng ủ rác hữu cơ nằm cạnh thùng tái chế đó.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_compost_bin_fail_94b84507.wav",
    text: "Thùng ủ rác hữu cơ nằm cạnh thùng tái chế đó.",
  },
  [normalizeText("Đúng rồi, đó là thùng ủ rác hữu cơ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_compost_bin_success_d4821055.wav",
    text: "Đúng rồi, đó là thùng ủ rác hữu cơ.",
  },
  [normalizeText("Chạm vào giá úp chén nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_dish_rack_95560e7f.wav",
    text: "Chạm vào giá úp chén nhé.",
  },
  [normalizeText("Giá úp chén nằm bên phải đó.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_dish_rack_fail_6f4190a0.wav",
    text: "Giá úp chén nằm bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là giá úp chén.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_dish_rack_success_ece0aca3.wav",
    text: "Đúng rồi, đó là giá úp chén.",
  },
  [normalizeText("Thùng tái chế nằm bên trái đó.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_recycling_bin_fail_69be5d54.wav",
    text: "Thùng tái chế nằm bên trái đó.",
  },
  [normalizeText("Chạm vào thùng tái chế nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_recycling_bin_fb70452d.wav",
    text: "Chạm vào thùng tái chế nhé.",
  },
  [normalizeText("Đúng rồi, đó là thùng tái chế.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_recycling_bin_success_294ea9eb.wav",
    text: "Đúng rồi, đó là thùng tái chế.",
  },
  [normalizeText("Bật đồng hồ hẹn giờ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_start_timer_e771c688.wav",
    text: "Bật đồng hồ hẹn giờ.",
  },
  [normalizeText("Đồng hồ hẹn giờ đã bắt đầu.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_start_timer_success_f3c93284.wav",
    text: "Đồng hồ hẹn giờ đã bắt đầu.",
  },
  [normalizeText("Chạm vào đồng hồ hẹn giờ nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_timer_b9ce984b.wav",
    text: "Chạm vào đồng hồ hẹn giờ nhé.",
  },
  [normalizeText("Đồng hồ hẹn giờ nằm phía trên bên phải đó.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_timer_fail_3026c1ee.wav",
    text: "Đồng hồ hẹn giờ nằm phía trên bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là đồng hồ hẹn giờ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/tap_timer_success_876d87c5.wav",
    text: "Đúng rồi, đó là đồng hồ hẹn giờ.",
  },
  [normalizeText("Mình học câu để chén khô tự nhiên nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_air_dry_dishes_c6bcbeb9.wav",
    text: "Mình học câu để chén khô tự nhiên nhé.",
  },
  [normalizeText("Để chén khô tự nhiên giúp tiết kiệm sức dọn.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_air_dry_dishes_success_879928ed.wav",
    text: "Để chén khô tự nhiên giúp tiết kiệm sức dọn.",
  },
  [normalizeText("Đây là tủ bếp.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_cabinet_4ea718a2.wav",
    text: "Đây là tủ bếp.",
  },
  [normalizeText("Từ này nghĩa là tủ bếp.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_cabinet_success_8b38f896.wav",
    text: "Từ này nghĩa là tủ bếp.",
  },
  [normalizeText("Đây là thùng ủ rác hữu cơ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_compost_bin_9e07413a.wav",
    text: "Đây là thùng ủ rác hữu cơ.",
  },
  [normalizeText("Từ này nghĩa là thùng ủ rác hữu cơ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_compost_bin_success_d04d45a9.wav",
    text: "Từ này nghĩa là thùng ủ rác hữu cơ.",
  },
  [normalizeText("Đây là giá úp chén.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_dish_rack_48233826.wav",
    text: "Đây là giá úp chén.",
  },
  [normalizeText("Từ này nghĩa là giá úp chén.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_dish_rack_success_da71ca99.wav",
    text: "Từ này nghĩa là giá úp chén.",
  },
  [normalizeText("Đây là tấm thấm khô.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_drying_mat_46febe06.wav",
    text: "Đây là tấm thấm khô.",
  },
  [normalizeText("Từ này nghĩa là tấm thấm khô.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_drying_mat_success_f41732c1.wav",
    text: "Từ này nghĩa là tấm thấm khô.",
  },
  [normalizeText("Đây là thùng tái chế.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_recycling_bin_6b4032db.wav",
    text: "Đây là thùng tái chế.",
  },
  [normalizeText("Từ này nghĩa là thùng tái chế.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_recycling_bin_success_f2f4bdec.wav",
    text: "Từ này nghĩa là thùng tái chế.",
  },
  [normalizeText("Mình học câu phân loại đồ tái chế nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_sort_recycling_63ef586a.wav",
    text: "Mình học câu phân loại đồ tái chế nhé.",
  },
  [normalizeText("Phân loại đồ tái chế giúp khu bếp gọn hơn.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_sort_recycling_success_65e0671d.wav",
    text: "Phân loại đồ tái chế giúp khu bếp gọn hơn.",
  },
  [normalizeText("Mình học câu bật hẹn giờ nhé.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_start_timer_3676a564.wav",
    text: "Mình học câu bật hẹn giờ nhé.",
  },
  [normalizeText("Bật hẹn giờ để nhớ lúc kiểm tra đồ đã khô.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_start_timer_success_043cb219.wav",
    text: "Bật hẹn giờ để nhớ lúc kiểm tra đồ đã khô.",
  },
  [normalizeText("Đây là đồng hồ hẹn giờ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_timer_442c532e.wav",
    text: "Đây là đồng hồ hẹn giờ.",
  },
  [normalizeText("Từ này nghĩa là đồng hồ hẹn giờ.")]: {
    key: "lessons/after-dinner-cleanup/sort-and-dry/audio/vi/teach_timer_success_9470cb85.wav",
    text: "Từ này nghĩa là đồng hồ hẹn giờ.",
  },
  [normalizeText("Bé đã xử lý vết bẩn sau bữa tối thật khéo!")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/completion_83042f8b.wav",
    text: "Bé đã xử lý vết bẩn sau bữa tối thật khéo!",
  },
  [normalizeText("Chà nhẹ chỗ bẩn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_brush_scrub_spot_93d5cfd0.wav",
    text: "Chà nhẹ chỗ bẩn.",
  },
  [normalizeText("Kéo bàn chải tới vết đổ nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_brush_scrub_spot_fail_c749b235.wav",
    text: "Kéo bàn chải tới vết đổ nhé.",
  },
  [normalizeText("Chỗ bẩn đã sạch hơn rồi.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_brush_scrub_spot_success_1e82d741.wav",
    text: "Chỗ bẩn đã sạch hơn rồi.",
  },
  [normalizeText("Đưa bàn chải dọn dẹp tới vết đổ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_brush_to_spill_12677771.wav",
    text: "Đưa bàn chải dọn dẹp tới vết đổ.",
  },
  [normalizeText("Kéo bàn chải dọn dẹp tới vết đổ nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_brush_to_spill_fail_da16b5af.wav",
    text: "Kéo bàn chải dọn dẹp tới vết đổ nhé.",
  },
  [normalizeText("Bàn chải đã ở đúng chỗ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_brush_to_spill_success_6f5445f3.wav",
    text: "Bàn chải đã ở đúng chỗ.",
  },
  [normalizeText("Xịt nhẹ lên vết bẩn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_spray_to_stain_044f5795.wav",
    text: "Xịt nhẹ lên vết bẩn.",
  },
  [normalizeText("Kéo bình xịt tới vết bẩn nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_spray_to_stain_fail_97c84077.wav",
    text: "Kéo bình xịt tới vết bẩn nhé.",
  },
  [normalizeText("Vết bẩn đã được xịt nhẹ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/drag_spray_to_stain_success_4f906722.wav",
    text: "Vết bẩn đã được xịt nhẹ.",
  },
  [normalizeText("Có vài vết bẩn sau bữa tối, mình xử lý nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/intro_9124cb92.wav",
    text: "Có vài vết bẩn sau bữa tối, mình xử lý nhé.",
  },
  [normalizeText("Xử lý từng vết nhỏ giúp khu ăn sạch hơn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/intro_success_43876700.wav",
    text: "Xử lý từng vết nhỏ giúp khu ăn sạch hơn.",
  },
  [normalizeText("Làm khô bề mặt đã lau.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_dry_surface_e3d39844.wav",
    text: "Làm khô bề mặt đã lau.",
  },
  [normalizeText("Chạm vào bề mặt đã lau nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_dry_surface_fail_e7bd01e6.wav",
    text: "Chạm vào bề mặt đã lau nhé.",
  },
  [normalizeText("Bề mặt đã khô ráo rồi.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_dry_surface_success_2ad67bb1.wav",
    text: "Bề mặt đã khô ráo rồi.",
  },
  [normalizeText("Chạm vào găng tay cao su nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_rubber_gloves_901a28d5.wav",
    text: "Chạm vào găng tay cao su nhé.",
  },
  [normalizeText("Găng tay cao su nằm cạnh bàn chải đó.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_rubber_gloves_fail_bb936b12.wav",
    text: "Găng tay cao su nằm cạnh bàn chải đó.",
  },
  [normalizeText("Đúng rồi, đó là găng tay cao su.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_rubber_gloves_success_4abef84c.wav",
    text: "Đúng rồi, đó là găng tay cao su.",
  },
  [normalizeText("Chạm vào cây gạt nhỏ nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_scraper_cb63d115.wav",
    text: "Chạm vào cây gạt nhỏ nhé.",
  },
  [normalizeText("Cây gạt nhỏ nằm bên trái đó.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_scraper_fail_02cec5e4.wav",
    text: "Cây gạt nhỏ nằm bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là cây gạt nhỏ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_scraper_success_3fb135f1.wav",
    text: "Đúng rồi, đó là cây gạt nhỏ.",
  },
  [normalizeText("Chạm vào vết đổ nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_spill_7ef4f990.wav",
    text: "Chạm vào vết đổ nhé.",
  },
  [normalizeText("Vết đổ nằm ở phía dưới đó.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_spill_fail_080480a7.wav",
    text: "Vết đổ nằm ở phía dưới đó.",
  },
  [normalizeText("Đúng rồi, đó là vết đổ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_spill_success_7a0f8943.wav",
    text: "Đúng rồi, đó là vết đổ.",
  },
  [normalizeText("Chạm vào bình xịt nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_spray_bottle_2e1796d8.wav",
    text: "Chạm vào bình xịt nhé.",
  },
  [normalizeText("Bình xịt đứng bên phải đó.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_spray_bottle_fail_62606023.wav",
    text: "Bình xịt đứng bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là bình xịt.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_spray_bottle_success_fe4ecfc6.wav",
    text: "Đúng rồi, đó là bình xịt.",
  },
  [normalizeText("Chạm vào vết bẩn nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_stain_92cf9570.wav",
    text: "Chạm vào vết bẩn nhé.",
  },
  [normalizeText("Vết bẩn nằm gần bình xịt đó.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_stain_fail_d339e97a.wav",
    text: "Vết bẩn nằm gần bình xịt đó.",
  },
  [normalizeText("Đúng rồi, đó là vết bẩn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/tap_stain_success_2d2f8e9c.wav",
    text: "Đúng rồi, đó là vết bẩn.",
  },
  [normalizeText("Đây là bàn chải dọn dẹp.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_cleaning_brush_d285feba.wav",
    text: "Đây là bàn chải dọn dẹp.",
  },
  [normalizeText("Từ này nghĩa là bàn chải dọn dẹp.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_cleaning_brush_success_af465158.wav",
    text: "Từ này nghĩa là bàn chải dọn dẹp.",
  },
  [normalizeText("Mình học câu làm khô bề mặt nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_dry_surface_20d3f4c8.wav",
    text: "Mình học câu làm khô bề mặt nhé.",
  },
  [normalizeText("Làm khô bề mặt giúp khu ăn sạch và an toàn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_dry_surface_success_70dbae3f.wav",
    text: "Làm khô bề mặt giúp khu ăn sạch và an toàn.",
  },
  [normalizeText("Đây là găng tay cao su.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_rubber_gloves_99f9b40b.wav",
    text: "Đây là găng tay cao su.",
  },
  [normalizeText("Từ này nghĩa là găng tay cao su.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_rubber_gloves_success_d2339729.wav",
    text: "Từ này nghĩa là găng tay cao su.",
  },
  [normalizeText("Đây là cây gạt nhỏ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_scraper_749bf7a1.wav",
    text: "Đây là cây gạt nhỏ.",
  },
  [normalizeText("Từ này nghĩa là cây gạt nhỏ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_scraper_success_2456fa30.wav",
    text: "Từ này nghĩa là cây gạt nhỏ.",
  },
  [normalizeText("Mình học câu chà chỗ bẩn nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_scrub_spot_a73093fe.wav",
    text: "Mình học câu chà chỗ bẩn nhé.",
  },
  [normalizeText("Chà nhẹ chỗ bẩn để khu ăn sạch hơn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_scrub_spot_success_9301f4a1.wav",
    text: "Chà nhẹ chỗ bẩn để khu ăn sạch hơn.",
  },
  [normalizeText("Đây là vết đổ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_spill_3a96095e.wav",
    text: "Đây là vết đổ.",
  },
  [normalizeText("Từ này nghĩa là vết đổ.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_spill_success_3441ebf5.wav",
    text: "Từ này nghĩa là vết đổ.",
  },
  [normalizeText("Đây là bình xịt.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_spray_bottle_8e3268a3.wav",
    text: "Đây là bình xịt.",
  },
  [normalizeText("Từ này nghĩa là bình xịt.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_spray_bottle_success_a852268c.wav",
    text: "Từ này nghĩa là bình xịt.",
  },
  [normalizeText("Mình học câu xịt vết bẩn nhé.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_spray_stain_c73ff320.wav",
    text: "Mình học câu xịt vết bẩn nhé.",
  },
  [normalizeText("Xịt nhẹ giúp vết bẩn dễ lau hơn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_spray_stain_success_aaa18785.wav",
    text: "Xịt nhẹ giúp vết bẩn dễ lau hơn.",
  },
  [normalizeText("Đây là vết bẩn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_stain_1a997421.wav",
    text: "Đây là vết bẩn.",
  },
  [normalizeText("Từ này nghĩa là vết bẩn.")]: {
    key: "lessons/after-dinner-cleanup/spot-clean/audio/vi/teach_stain_success_a4dfd650.wav",
    text: "Từ này nghĩa là vết bẩn.",
  },
  [normalizeText("Bé đã mặc đồ sau tắm thật gọn gàng!")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/completion_e60ffa15.wav",
    text: "Bé đã mặc đồ sau tắm thật gọn gàng!",
  },
  [normalizeText("Bỏ quần áo đã thay vào giỏ đồ giặt.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_clothes_to_basket_d1f61e4b.wav",
    text: "Bỏ quần áo đã thay vào giỏ đồ giặt.",
  },
  [normalizeText("Kéo quần áo đã thay tới giỏ đồ giặt nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_clothes_to_basket_fail_bddbc2e1.wav",
    text: "Kéo quần áo đã thay tới giỏ đồ giặt nhé.",
  },
  [normalizeText("Quần áo đã nằm trong giỏ đồ giặt.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_clothes_to_basket_success_cdfcfba5.wav",
    text: "Quần áo đã nằm trong giỏ đồ giặt.",
  },
  [normalizeText("Chải tóc cho bé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_comb_to_hair_694c3f66.wav",
    text: "Chải tóc cho bé.",
  },
  [normalizeText("Kéo cái lược tới tóc bé nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_comb_to_hair_fail_34577edd.wav",
    text: "Kéo cái lược tới tóc bé nhé.",
  },
  [normalizeText("Tóc bé đã gọn gàng rồi.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_comb_to_hair_success_9884ad4e.wav",
    text: "Tóc bé đã gọn gàng rồi.",
  },
  [normalizeText("Mặc đồ ngủ cho bé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_pajamas_to_baby_47b93177.wav",
    text: "Mặc đồ ngủ cho bé.",
  },
  [normalizeText("Kéo đồ ngủ tới người bé nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_pajamas_to_baby_fail_d6d4097a.wav",
    text: "Kéo đồ ngủ tới người bé nhé.",
  },
  [normalizeText("Bé đã mặc đồ ngủ khô ráo.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_pajamas_to_baby_success_3c81662a.wav",
    text: "Bé đã mặc đồ ngủ khô ráo.",
  },
  [normalizeText("Treo áo choàng lên móc.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_robe_to_hook_76e9e251.wav",
    text: "Treo áo choàng lên móc.",
  },
  [normalizeText("Kéo áo choàng tới móc treo nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_robe_to_hook_fail_6f302aae.wav",
    text: "Kéo áo choàng tới móc treo nhé.",
  },
  [normalizeText("Áo choàng đã được treo gọn gàng.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_robe_to_hook_success_a64431da.wav",
    text: "Áo choàng đã được treo gọn gàng.",
  },
  [normalizeText("Mang dép đi trong nhà.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_slippers_to_feet_f4338c9e.wav",
    text: "Mang dép đi trong nhà.",
  },
  [normalizeText("Kéo dép đi trong nhà tới chân bé nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_slippers_to_feet_fail_a1b7c969.wav",
    text: "Kéo dép đi trong nhà tới chân bé nhé.",
  },
  [normalizeText("Bé đã mang dép đi trong nhà.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/drag_slippers_to_feet_success_de0ca1ce.wav",
    text: "Bé đã mang dép đi trong nhà.",
  },
  [normalizeText("Tắm xong rồi, mình mặc đồ sạch nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/intro_6939e72e.wav",
    text: "Tắm xong rồi, mình mặc đồ sạch nhé.",
  },
  [normalizeText("Sau khi tắm, bé mặc đồ khô để giữ ấm.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/intro_success_64656f92.wav",
    text: "Sau khi tắm, bé mặc đồ khô để giữ ấm.",
  },
  [normalizeText("Chạm vào cái lược nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_comb_f7107507.wav",
    text: "Chạm vào cái lược nhé.",
  },
  [normalizeText("Cái lược nằm trên kệ nhỏ đó.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_comb_fail_0e9ad016.wav",
    text: "Cái lược nằm trên kệ nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là cái lược.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_comb_success_a26f856e.wav",
    text: "Đúng rồi, đó là cái lược.",
  },
  [normalizeText("Chạm vào móc treo nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_hook_3951aee9.wav",
    text: "Chạm vào móc treo nhé.",
  },
  [normalizeText("Móc treo nằm trên tường bên phải đó.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_hook_fail_e25886e4.wav",
    text: "Móc treo nằm trên tường bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là móc treo.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_hook_success_e4671a22.wav",
    text: "Đúng rồi, đó là móc treo.",
  },
  [normalizeText("Chạm vào đồ ngủ nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_pajamas_e3850bdc.wav",
    text: "Chạm vào đồ ngủ nhé.",
  },
  [normalizeText("Bộ đồ ngủ nằm cạnh bé đó.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_pajamas_fail_1beeb6d3.wav",
    text: "Bộ đồ ngủ nằm cạnh bé đó.",
  },
  [normalizeText("Đúng rồi, đó là đồ ngủ.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_pajamas_success_e5e62db9.wav",
    text: "Đúng rồi, đó là đồ ngủ.",
  },
  [normalizeText("Áo choàng tắm treo bên phải đó.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_robe_fail_0d1b0c43.wav",
    text: "Áo choàng tắm treo bên phải đó.",
  },
  [normalizeText("Chạm vào áo choàng tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_robe_fe42711f.wav",
    text: "Chạm vào áo choàng tắm nhé.",
  },
  [normalizeText("Đúng rồi, đó là áo choàng tắm.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/tap_robe_success_f4b996a6.wav",
    text: "Đúng rồi, đó là áo choàng tắm.",
  },
  [normalizeText("Đây là cái lược.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_comb_9e2c73e7.wav",
    text: "Đây là cái lược.",
  },
  [normalizeText("Mình học câu chải tóc nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_comb_hair_fc012c11.wav",
    text: "Mình học câu chải tóc nhé.",
  },
  [normalizeText("Chải tóc giúp tóc gọn gàng sau khi tắm.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_comb_hair_success_182d87c9.wav",
    text: "Chải tóc giúp tóc gọn gàng sau khi tắm.",
  },
  [normalizeText("Từ này nghĩa là cái lược.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_comb_success_fdccb1b8.wav",
    text: "Từ này nghĩa là cái lược.",
  },
  [normalizeText("Mình học câu treo áo choàng nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_hang_robe_3bcf0351.wav",
    text: "Mình học câu treo áo choàng nhé.",
  },
  [normalizeText("Treo áo choàng giúp góc tắm gọn hơn.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_hang_robe_success_52afedf5.wav",
    text: "Treo áo choàng giúp góc tắm gọn hơn.",
  },
  [normalizeText("Đây là móc treo.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_hook_e8b43b1c.wav",
    text: "Đây là móc treo.",
  },
  [normalizeText("Từ này nghĩa là móc treo.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_hook_success_1d7adb07.wav",
    text: "Từ này nghĩa là móc treo.",
  },
  [normalizeText("Đây là giỏ đồ giặt.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_laundry_basket_25ba81be.wav",
    text: "Đây là giỏ đồ giặt.",
  },
  [normalizeText("Từ này nghĩa là giỏ đồ giặt.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_laundry_basket_success_aac0a08a.wav",
    text: "Từ này nghĩa là giỏ đồ giặt.",
  },
  [normalizeText("Đây là đồ ngủ.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_pajamas_b011bcf3.wav",
    text: "Đây là đồ ngủ.",
  },
  [normalizeText("Từ này nghĩa là đồ ngủ.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_pajamas_success_53b678a1.wav",
    text: "Từ này nghĩa là đồ ngủ.",
  },
  [normalizeText("Mình học câu mặc đồ ngủ nhé.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_put_on_pajamas_28b6420f.wav",
    text: "Mình học câu mặc đồ ngủ nhé.",
  },
  [normalizeText("Mặc đồ ngủ giúp bé sẵn sàng nghỉ ngơi.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_put_on_pajamas_success_3d597d28.wav",
    text: "Mặc đồ ngủ giúp bé sẵn sàng nghỉ ngơi.",
  },
  [normalizeText("Đây là áo choàng tắm.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_robe_f07ea821.wav",
    text: "Đây là áo choàng tắm.",
  },
  [normalizeText("Từ này nghĩa là áo choàng tắm.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_robe_success_716b6060.wav",
    text: "Từ này nghĩa là áo choàng tắm.",
  },
  [normalizeText("Đây là dép đi trong nhà.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_slippers_e72122b3.wav",
    text: "Đây là dép đi trong nhà.",
  },
  [normalizeText("Từ này nghĩa là dép đi trong nhà.")]: {
    key: "lessons/afternoon-bath/bath-finish/audio/vi/teach_slippers_success_112b1d45.wav",
    text: "Từ này nghĩa là dép đi trong nhà.",
  },
  [normalizeText("Bé đã chuẩn bị tắm thật cẩn thận!")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/completion_a57ab145.wav",
    text: "Bé đã chuẩn bị tắm thật cẩn thận!",
  },
  [normalizeText("Cho sữa tắm lên miếng bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/drag_body_wash_to_sponge_d79a31a3.wav",
    text: "Cho sữa tắm lên miếng bọt tắm.",
  },
  [normalizeText("Kéo sữa tắm tới miếng bọt tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/drag_body_wash_to_sponge_fail_b8c39f09.wav",
    text: "Kéo sữa tắm tới miếng bọt tắm nhé.",
  },
  [normalizeText("Miếng bọt tắm đã sẵn sàng.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/drag_body_wash_to_sponge_success_e5f0e4af.wav",
    text: "Miếng bọt tắm đã sẵn sàng.",
  },
  [normalizeText("Đặt thảm tắm cạnh bồn tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/drag_mat_to_bathtub_0c1f3d06.wav",
    text: "Đặt thảm tắm cạnh bồn tắm.",
  },
  [normalizeText("Kéo thảm tắm tới cạnh bồn tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/drag_mat_to_bathtub_fail_5910cd48.wav",
    text: "Kéo thảm tắm tới cạnh bồn tắm nhé.",
  },
  [normalizeText("Thảm tắm đã nằm đúng chỗ.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/drag_mat_to_bathtub_success_f3597021.wav",
    text: "Thảm tắm đã nằm đúng chỗ.",
  },
  [normalizeText("Chiều rồi, mình chuẩn bị tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/intro_bbd6d599.wav",
    text: "Chiều rồi, mình chuẩn bị tắm nhé.",
  },
  [normalizeText("Chuẩn bị trước giúp bé tắm an toàn và gọn gàng.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/intro_success_62a6af27.wav",
    text: "Chuẩn bị trước giúp bé tắm an toàn và gọn gàng.",
  },
  [normalizeText("Chạm vào miếng bọt tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_bath_sponge_2be63200.wav",
    text: "Chạm vào miếng bọt tắm nhé.",
  },
  [normalizeText("Miếng bọt tắm nằm giữa hai chai nhỏ đó.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_bath_sponge_fail_48a1dcf2.wav",
    text: "Miếng bọt tắm nằm giữa hai chai nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là miếng bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_bath_sponge_success_9aef3bc7.wav",
    text: "Đúng rồi, đó là miếng bọt tắm.",
  },
  [normalizeText("Chạm vào bồn tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_bathtub_031f6982.wav",
    text: "Chạm vào bồn tắm nhé.",
  },
  [normalizeText("Bồn tắm nằm ở giữa phòng tắm đó.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_bathtub_fail_10069d5a.wav",
    text: "Bồn tắm nằm ở giữa phòng tắm đó.",
  },
  [normalizeText("Đúng rồi, đó là bồn tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_bathtub_success_85fe0b4f.wav",
    text: "Đúng rồi, đó là bồn tắm.",
  },
  [normalizeText("Kiểm tra độ ấm trong bồn tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_check_temperature_72e22656.wav",
    text: "Kiểm tra độ ấm trong bồn tắm.",
  },
  [normalizeText("Chạm vào bồn tắm để kiểm tra độ ấm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_check_temperature_fail_96d28597.wav",
    text: "Chạm vào bồn tắm để kiểm tra độ ấm nhé.",
  },
  [normalizeText("Độ ấm vừa rồi, bé có thể tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_check_temperature_success_be3cdbec.wav",
    text: "Độ ấm vừa rồi, bé có thể tắm.",
  },
  [normalizeText("Chạm vào dầu gội nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_shampoo_639c8ee9.wav",
    text: "Chạm vào dầu gội nhé.",
  },
  [normalizeText("Chai dầu gội nằm bên cạnh miếng bọt tắm đó.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_shampoo_fail_dc144386.wav",
    text: "Chai dầu gội nằm bên cạnh miếng bọt tắm đó.",
  },
  [normalizeText("Đúng rồi, đó là dầu gội.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_shampoo_success_080bcbf7.wav",
    text: "Đúng rồi, đó là dầu gội.",
  },
  [normalizeText("Chạm vào vòi sen nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_shower_ad5654a3.wav",
    text: "Chạm vào vòi sen nhé.",
  },
  [normalizeText("Vòi sen nằm phía trên bồn tắm đó.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_shower_fail_035d304e.wav",
    text: "Vòi sen nằm phía trên bồn tắm đó.",
  },
  [normalizeText("Đúng rồi, đó là vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_shower_success_695b7d7d.wav",
    text: "Đúng rồi, đó là vòi sen.",
  },
  [normalizeText("Bước lên thảm tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_step_onto_mat_6bbf0d44.wav",
    text: "Bước lên thảm tắm.",
  },
  [normalizeText("Chạm vào thảm tắm dưới chân bé nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_step_onto_mat_fail_0c74eaab.wav",
    text: "Chạm vào thảm tắm dưới chân bé nhé.",
  },
  [normalizeText("Bé đã đứng trên thảm tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_step_onto_mat_success_cec7f932.wav",
    text: "Bé đã đứng trên thảm tắm.",
  },
  [normalizeText("Mở vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_turn_on_shower_75224f9f.wav",
    text: "Mở vòi sen.",
  },
  [normalizeText("Chạm vào vòi sen phía trên bồn tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_turn_on_shower_fail_5d11ad80.wav",
    text: "Chạm vào vòi sen phía trên bồn tắm nhé.",
  },
  [normalizeText("Vòi sen đã bật rồi.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/tap_turn_on_shower_success_86addf27.wav",
    text: "Vòi sen đã bật rồi.",
  },
  [normalizeText("Đây là thảm tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_bath_mat_22449152.wav",
    text: "Đây là thảm tắm.",
  },
  [normalizeText("Từ này nghĩa là thảm tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_bath_mat_success_1a0b5196.wav",
    text: "Từ này nghĩa là thảm tắm.",
  },
  [normalizeText("Đây là miếng bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_bath_sponge_3ef096ad.wav",
    text: "Đây là miếng bọt tắm.",
  },
  [normalizeText("Từ này nghĩa là miếng bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_bath_sponge_success_132df8cc.wav",
    text: "Từ này nghĩa là miếng bọt tắm.",
  },
  [normalizeText("Đây là bồn tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_bathtub_3e8d604f.wav",
    text: "Đây là bồn tắm.",
  },
  [normalizeText("Từ này nghĩa là bồn tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_bathtub_success_c0ad7cf1.wav",
    text: "Từ này nghĩa là bồn tắm.",
  },
  [normalizeText("Đây là sữa tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_body_wash_52f9c3d7.wav",
    text: "Đây là sữa tắm.",
  },
  [normalizeText("Từ này nghĩa là sữa tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_body_wash_success_1eb72ca2.wav",
    text: "Từ này nghĩa là sữa tắm.",
  },
  [normalizeText("Mình học câu kiểm tra độ ấm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_check_temperature_3b42cd15.wav",
    text: "Mình học câu kiểm tra độ ấm nhé.",
  },
  [normalizeText("Kiểm tra độ ấm trước giúp bé tắm an toàn.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_check_temperature_success_07e8a76d.wav",
    text: "Kiểm tra độ ấm trước giúp bé tắm an toàn.",
  },
  [normalizeText("Đây là dầu gội.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_shampoo_98437d3a.wav",
    text: "Đây là dầu gội.",
  },
  [normalizeText("Từ này nghĩa là dầu gội.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_shampoo_success_adaa61ba.wav",
    text: "Từ này nghĩa là dầu gội.",
  },
  [normalizeText("Đây là vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_shower_1920483b.wav",
    text: "Đây là vòi sen.",
  },
  [normalizeText("Từ này nghĩa là vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_shower_success_9fc8d714.wav",
    text: "Từ này nghĩa là vòi sen.",
  },
  [normalizeText("Mình học câu bước lên thảm nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_step_onto_mat_0ebfe0c0.wav",
    text: "Mình học câu bước lên thảm nhé.",
  },
  [normalizeText("Bước lên thảm giúp bé đứng chắc hơn.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_step_onto_mat_success_786e1612.wav",
    text: "Bước lên thảm giúp bé đứng chắc hơn.",
  },
  [normalizeText("Mình học câu mở vòi sen nhé.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_turn_on_shower_82c3c572.wav",
    text: "Mình học câu mở vòi sen nhé.",
  },
  [normalizeText("Mở vòi sen trước khi tắm.")]: {
    key: "lessons/afternoon-bath/bath-prep/audio/vi/teach_turn_on_shower_success_04ceb527.wav",
    text: "Mở vòi sen trước khi tắm.",
  },
  [normalizeText("Bé đã tắm và xả sạch thật khéo!")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/completion_9065a43f.wav",
    text: "Bé đã tắm và xả sạch thật khéo!",
  },
  [normalizeText("Tạo bong bóng từ bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_foam_to_bubbles_acdbf315.wav",
    text: "Tạo bong bóng từ bọt tắm.",
  },
  [normalizeText("Kéo bọt tắm tới bong bóng nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_foam_to_bubbles_fail_1a069d48.wav",
    text: "Kéo bọt tắm tới bong bóng nhé.",
  },
  [normalizeText("Bong bóng đã nổi lên rồi.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_foam_to_bubbles_success_be182aa5.wav",
    text: "Bong bóng đã nổi lên rồi.",
  },
  [normalizeText("Xả sạch tóc cho bé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_shower_head_to_hair_9878a4c4.wav",
    text: "Xả sạch tóc cho bé.",
  },
  [normalizeText("Kéo đầu vòi sen tới tóc bé nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_shower_head_to_hair_fail_30c04e23.wav",
    text: "Kéo đầu vòi sen tới tóc bé nhé.",
  },
  [normalizeText("Tóc đã sạch bọt rồi.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_shower_head_to_hair_success_159c8bfd.wav",
    text: "Tóc đã sạch bọt rồi.",
  },
  [normalizeText("Chà nhẹ đầu gối.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_sponge_to_knee_a8f59b37.wav",
    text: "Chà nhẹ đầu gối.",
  },
  [normalizeText("Kéo miếng bọt tắm tới đầu gối nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_sponge_to_knee_fail_c8d75538.wav",
    text: "Kéo miếng bọt tắm tới đầu gối nhé.",
  },
  [normalizeText("Đầu gối đã sạch hơn rồi.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/drag_sponge_to_knee_success_6e8c99f3.wav",
    text: "Đầu gối đã sạch hơn rồi.",
  },
  [normalizeText("Mình tắm sạch sau khi chơi nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/intro_cc3de4a1.wav",
    text: "Mình tắm sạch sau khi chơi nhé.",
  },
  [normalizeText("Tắm sạch giúp bé dễ chịu sau buổi chiều.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/intro_success_7bd54346.wav",
    text: "Tắm sạch giúp bé dễ chịu sau buổi chiều.",
  },
  [normalizeText("Chạm vào bong bóng nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_bubble_606215a6.wav",
    text: "Chạm vào bong bóng nhé.",
  },
  [normalizeText("Bong bóng đang bay gần bồn tắm đó.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_bubble_fail_3deb3166.wav",
    text: "Bong bóng đang bay gần bồn tắm đó.",
  },
  [normalizeText("Đúng rồi, đó là bong bóng.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_bubble_success_9ded25b2.wav",
    text: "Đúng rồi, đó là bong bóng.",
  },
  [normalizeText("Chạm vào khuỷu tay nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_elbow_05969d21.wav",
    text: "Chạm vào khuỷu tay nhé.",
  },
  [normalizeText("Khuỷu tay nằm cạnh người bé đó.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_elbow_fail_b4e41eed.wav",
    text: "Khuỷu tay nằm cạnh người bé đó.",
  },
  [normalizeText("Đúng rồi, đó là khuỷu tay.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_elbow_success_48f9ab26.wav",
    text: "Đúng rồi, đó là khuỷu tay.",
  },
  [normalizeText("Chạm vào bọt tắm nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_foam_55cd174f.wav",
    text: "Chạm vào bọt tắm nhé.",
  },
  [normalizeText("Bọt tắm nằm trong bồn tắm đó.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_foam_fail_856d5150.wav",
    text: "Bọt tắm nằm trong bồn tắm đó.",
  },
  [normalizeText("Đúng rồi, đó là bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_foam_success_598983ff.wav",
    text: "Đúng rồi, đó là bọt tắm.",
  },
  [normalizeText("Chạm vào đầu gối nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_knee_23d5c744.wav",
    text: "Chạm vào đầu gối nhé.",
  },
  [normalizeText("Đầu gối ở phía dưới đó.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_knee_fail_d54d959d.wav",
    text: "Đầu gối ở phía dưới đó.",
  },
  [normalizeText("Đúng rồi, đó là đầu gối.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_knee_success_ab580eed.wav",
    text: "Đúng rồi, đó là đầu gối.",
  },
  [normalizeText("Chạm vào vai nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_shoulder_5fad872d.wav",
    text: "Chạm vào vai nhé.",
  },
  [normalizeText("Vai nằm gần cổ bé đó.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_shoulder_fail_9afec147.wav",
    text: "Vai nằm gần cổ bé đó.",
  },
  [normalizeText("Đúng rồi, đó là vai.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_shoulder_success_a7ea2087.wav",
    text: "Đúng rồi, đó là vai.",
  },
  [normalizeText("Chạm vào đầu vòi sen nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_shower_head_6780f98d.wav",
    text: "Chạm vào đầu vòi sen nhé.",
  },
  [normalizeText("Đầu vòi sen nằm bên phải đó.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_shower_head_fail_afa200b9.wav",
    text: "Đầu vòi sen nằm bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là đầu vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/tap_shower_head_success_78c4251c.wav",
    text: "Đúng rồi, đó là đầu vòi sen.",
  },
  [normalizeText("Đây là bong bóng.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_bubble_51fbe3c9.wav",
    text: "Đây là bong bóng.",
  },
  [normalizeText("Từ này nghĩa là bong bóng.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_bubble_success_b07813e3.wav",
    text: "Từ này nghĩa là bong bóng.",
  },
  [normalizeText("Đây là khuỷu tay.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_elbow_7251afd3.wav",
    text: "Đây là khuỷu tay.",
  },
  [normalizeText("Từ này nghĩa là khuỷu tay.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_elbow_success_c7cf29e3.wav",
    text: "Từ này nghĩa là khuỷu tay.",
  },
  [normalizeText("Đây là bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_foam_8d0a2223.wav",
    text: "Đây là bọt tắm.",
  },
  [normalizeText("Từ này nghĩa là bọt tắm.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_foam_success_2d59ed7c.wav",
    text: "Từ này nghĩa là bọt tắm.",
  },
  [normalizeText("Đây là đầu gối.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_knee_4f1f2f65.wav",
    text: "Đây là đầu gối.",
  },
  [normalizeText("Từ này nghĩa là đầu gối.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_knee_success_b4001331.wav",
    text: "Từ này nghĩa là đầu gối.",
  },
  [normalizeText("Mình học câu tạo bong bóng nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_make_bubbles_b994533f.wav",
    text: "Mình học câu tạo bong bóng nhé.",
  },
  [normalizeText("Bọt tắm có thể tạo bong bóng vui mắt.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_make_bubbles_success_dc97e239.wav",
    text: "Bọt tắm có thể tạo bong bóng vui mắt.",
  },
  [normalizeText("Mình học câu xả tóc nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_rinse_hair_e4c90426.wav",
    text: "Mình học câu xả tóc nhé.",
  },
  [normalizeText("Xả tóc giúp trôi hết bọt.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_rinse_hair_success_ae95908a.wav",
    text: "Xả tóc giúp trôi hết bọt.",
  },
  [normalizeText("Mình học câu chà đầu gối nhé.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_scrub_knees_3d1dfaf8.wav",
    text: "Mình học câu chà đầu gối nhé.",
  },
  [normalizeText("Chà nhẹ đầu gối để bé sạch hơn.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_scrub_knees_success_7b3b2782.wav",
    text: "Chà nhẹ đầu gối để bé sạch hơn.",
  },
  [normalizeText("Đây là vai.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_shoulder_6d9b5779.wav",
    text: "Đây là vai.",
  },
  [normalizeText("Từ này nghĩa là vai.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_shoulder_success_901b10c5.wav",
    text: "Từ này nghĩa là vai.",
  },
  [normalizeText("Đây là đầu vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_shower_head_df2bda3d.wav",
    text: "Đây là đầu vòi sen.",
  },
  [normalizeText("Từ này nghĩa là đầu vòi sen.")]: {
    key: "lessons/afternoon-bath/bath-rinse/audio/vi/teach_shower_head_success_21a03191.wav",
    text: "Từ này nghĩa là đầu vòi sen.",
  },
  [normalizeText("Bé đã chuẩn bị ra về thật gọn gàng.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/completion_4ba5f854.wav",
    text: "Bé đã chuẩn bị ra về thật gọn gàng.",
  },
  [normalizeText("Đưa cặp sách tới cửa lớp.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bag_to_door_e74dc453.wav",
    text: "Đưa cặp sách tới cửa lớp.",
  },
  [normalizeText("Kéo cặp sách tới gần cửa nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bag_to_door_fail_8b4148f0.wav",
    text: "Kéo cặp sách tới gần cửa nhé.",
  },
  [normalizeText("Cặp sách đã ở gần cửa rồi!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bag_to_door_success_5a4b6c3d.wav",
    text: "Cặp sách đã ở gần cửa rồi!",
  },
  [normalizeText("Đưa cặp sách tới vạch xếp hàng.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bag_to_line_206fb4a9.wav",
    text: "Đưa cặp sách tới vạch xếp hàng.",
  },
  [normalizeText("Đưa cặp sách tới vạch xếp hàng nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bag_to_line_fail_39d560ab.wav",
    text: "Đưa cặp sách tới vạch xếp hàng nhé.",
  },
  [normalizeText("Bé đã xếp hàng ra về!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bag_to_line_success_527d4f38.wav",
    text: "Bé đã xếp hàng ra về!",
  },
  [normalizeText("Cất bình nước vào cặp sách.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bottle_to_bag_969a983d.wav",
    text: "Cất bình nước vào cặp sách.",
  },
  [normalizeText("Đưa bình nước vào cặp sách nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bottle_to_bag_fail_a8a840aa.wav",
    text: "Đưa bình nước vào cặp sách nhé.",
  },
  [normalizeText("Bình nước đã ở trong cặp.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_bottle_to_bag_success_0e99662e.wav",
    text: "Bình nước đã ở trong cặp.",
  },
  [normalizeText("Xếp bìa hồ sơ vào cặp sách.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_folder_to_bag_d79f10e9.wav",
    text: "Xếp bìa hồ sơ vào cặp sách.",
  },
  [normalizeText("Đưa bìa hồ sơ vào cặp sách nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_folder_to_bag_fail_00160c65.wav",
    text: "Đưa bìa hồ sơ vào cặp sách nhé.",
  },
  [normalizeText("Cặp sách đã gọn rồi!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/drag_folder_to_bag_success_fb8d274b.wav",
    text: "Cặp sách đã gọn rồi!",
  },
  [normalizeText("Chiều rồi, mình chuẩn bị về nhà nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/intro_4da8d16b.wav",
    text: "Chiều rồi, mình chuẩn bị về nhà nhé.",
  },
  [normalizeText("Mình sẵn sàng ra về nào!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/intro_success_752ac9f6.wav",
    text: "Mình sẵn sàng ra về nào!",
  },
  [normalizeText("Chạm vào cặp sách nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_bag_b54b7b2f.wav",
    text: "Chạm vào cặp sách nhé.",
  },
  [normalizeText("Cặp sách nằm gần chân bé đó.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_bag_fail_d00f3b02.wav",
    text: "Cặp sách nằm gần chân bé đó.",
  },
  [normalizeText("Đúng rồi, đó là cặp sách.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_bag_success_2f26bb6e.wav",
    text: "Đúng rồi, đó là cặp sách.",
  },
  [normalizeText("Chạm vào bìa hồ sơ nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_folder_007303cf.wav",
    text: "Chạm vào bìa hồ sơ nhé.",
  },
  [normalizeText("Bìa hồ sơ nằm trên bàn nhỏ đó.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_folder_fail_081499ac.wav",
    text: "Bìa hồ sơ nằm trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là bìa hồ sơ.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_folder_success_9d1c6477.wav",
    text: "Đúng rồi, đó là bìa hồ sơ.",
  },
  [normalizeText("Chạm thẻ tạm biệt để chào cô.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_goodbye_card_e189b613.wav",
    text: "Chạm thẻ tạm biệt để chào cô.",
  },
  [normalizeText("Chạm thẻ tạm biệt gần cô giáo nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_goodbye_card_fail_ffb32fc8.wav",
    text: "Chạm thẻ tạm biệt gần cô giáo nhé.",
  },
  [normalizeText("Bé chào cô rất lễ phép!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_goodbye_card_success_997b7c99.wav",
    text: "Bé chào cô rất lễ phép!",
  },
  [normalizeText("Chạm vào áo khoác nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_jacket_bf5ce23d.wav",
    text: "Chạm vào áo khoác nhé.",
  },
  [normalizeText("Áo khoác nằm cạnh cặp sách đó.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_jacket_fail_353966b8.wav",
    text: "Áo khoác nằm cạnh cặp sách đó.",
  },
  [normalizeText("Con tìm thấy áo khoác rồi!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_jacket_success_b4eaffab.wav",
    text: "Con tìm thấy áo khoác rồi!",
  },
  [normalizeText("Cô giáo đứng bên trái lớp đó.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_teacher_fail_3bda11a0.wav",
    text: "Cô giáo đứng bên trái lớp đó.",
  },
  [normalizeText("Con tìm thấy cô giáo rồi!")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/tap_teacher_success_ecd8d12e.wav",
    text: "Con tìm thấy cô giáo rồi!",
  },
  [normalizeText("Đây là cánh cửa.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_door_1721fb07.wav",
    text: "Đây là cánh cửa.",
  },
  [normalizeText("Từ này nghĩa là cánh cửa.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_door_success_8f02d517.wav",
    text: "Từ này nghĩa là cánh cửa.",
  },
  [normalizeText("Đây là bìa hồ sơ.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_folder_ff4399f8.wav",
    text: "Đây là bìa hồ sơ.",
  },
  [normalizeText("Từ này nghĩa là bìa hồ sơ.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_folder_success_b169a653.wav",
    text: "Từ này nghĩa là bìa hồ sơ.",
  },
  [normalizeText("Đây là áo khoác.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_jacket_4907d9f0.wav",
    text: "Đây là áo khoác.",
  },
  [normalizeText("Từ này nghĩa là áo khoác.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_jacket_success_a3da2087.wav",
    text: "Từ này nghĩa là áo khoác.",
  },
  [normalizeText("Mình học câu xếp hàng nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_line_up_ff8e5f5f.wav",
    text: "Mình học câu xếp hàng nhé.",
  },
  [normalizeText("Câu này nghĩa là xếp hàng.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_line_up_success_cacd015e.wav",
    text: "Câu này nghĩa là xếp hàng.",
  },
  [normalizeText("Mình học câu chào tạm biệt nhé.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_say_goodbye_babd7716.wav",
    text: "Mình học câu chào tạm biệt nhé.",
  },
  [normalizeText("Câu này nghĩa là chào tạm biệt.")]: {
    key: "lessons/afternoon-home/going-home/audio/vi/teach_say_goodbye_success_a9157f91.wav",
    text: "Câu này nghĩa là chào tạm biệt.",
  },
  [normalizeText("Bé đã về nhà và làm các bước chiều về.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/completion_598ecb32.wav",
    text: "Bé đã về nhà và làm các bước chiều về.",
  },
  [normalizeText("Đặt giày vào góc cửa.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/drag_shoes_to_door_cd31ff8d.wav",
    text: "Đặt giày vào góc cửa.",
  },
  [normalizeText("Đưa giày vào góc cửa nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/drag_shoes_to_door_fail_80aad053.wav",
    text: "Đưa giày vào góc cửa nhé.",
  },
  [normalizeText("Giày đã gọn ở góc cửa.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/drag_shoes_to_door_success_30866976.wav",
    text: "Giày đã gọn ở góc cửa.",
  },
  [normalizeText("Cởi giày rồi đặt lên kệ.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/drag_shoes_to_shelf_3c9be7bb.wav",
    text: "Cởi giày rồi đặt lên kệ.",
  },
  [normalizeText("Đưa giày lên kệ giày nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/drag_shoes_to_shelf_fail_ee6da10c.wav",
    text: "Đưa giày lên kệ giày nhé.",
  },
  [normalizeText("Giày đã ở trên kệ rồi!")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/drag_shoes_to_shelf_success_87312b00.wav",
    text: "Giày đã ở trên kệ rồi!",
  },
  [normalizeText("Mình đã về tới nhà rồi.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/intro_cb029631.wav",
    text: "Mình đã về tới nhà rồi.",
  },
  [normalizeText("Nhà mình đây rồi!")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/intro_success_ca780ad2.wav",
    text: "Nhà mình đây rồi!",
  },
  [normalizeText("Chạm vào gia đình nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_family_b508bdca.wav",
    text: "Chạm vào gia đình nhé.",
  },
  [normalizeText("Gia đình đang đứng gần cửa nhà đó.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_family_fail_308ce539.wav",
    text: "Gia đình đang đứng gần cửa nhà đó.",
  },
  [normalizeText("Chạm vào gia đình để chào cả nhà nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_family_hug_fail_85849b44.wav",
    text: "Chạm vào gia đình để chào cả nhà nhé.",
  },
  [normalizeText("Chạm vào gia đình để ôm cả nhà.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_family_hug_fc8f4bb7.wav",
    text: "Chạm vào gia đình để ôm cả nhà.",
  },
  [normalizeText("Bé đã chào cả nhà thật ấm áp!")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_family_hug_success_361c856f.wav",
    text: "Bé đã chào cả nhà thật ấm áp!",
  },
  [normalizeText("Con tìm thấy gia đình rồi!")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_family_success_3b682334.wav",
    text: "Con tìm thấy gia đình rồi!",
  },
  [normalizeText("Ngôi nhà ở phía trên bên phải đó.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_home_fail_3ceadf43.wav",
    text: "Ngôi nhà ở phía trên bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là nhà.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_home_success_c67654fd.wav",
    text: "Đúng rồi, đó là nhà.",
  },
  [normalizeText("Chạm vào kệ giày nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_shelf_10596c01.wav",
    text: "Chạm vào kệ giày nhé.",
  },
  [normalizeText("Kệ giày nằm cạnh cửa đó.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_shelf_fail_484b63c9.wav",
    text: "Kệ giày nằm cạnh cửa đó.",
  },
  [normalizeText("Đúng rồi, đó là kệ giày.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_shelf_success_35e9b38f.wav",
    text: "Đúng rồi, đó là kệ giày.",
  },
  [normalizeText("Xà phòng ở gần chỗ rửa tay đó.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_soap_fail_c8f14057.wav",
    text: "Xà phòng ở gần chỗ rửa tay đó.",
  },
  [normalizeText("Khăn lau treo gần xà phòng đó.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/tap_towel_fail_83aff814.wav",
    text: "Khăn lau treo gần xà phòng đó.",
  },
  [normalizeText("Đây là gia đình.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_family_6624673c.wav",
    text: "Đây là gia đình.",
  },
  [normalizeText("Từ này nghĩa là gia đình.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_family_success_21ee7acd.wav",
    text: "Từ này nghĩa là gia đình.",
  },
  [normalizeText("Mình học câu ôm gia đình nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_hug_family_092c12d6.wav",
    text: "Mình học câu ôm gia đình nhé.",
  },
  [normalizeText("Câu này nghĩa là ôm gia đình.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_hug_family_success_64fb10be.wav",
    text: "Câu này nghĩa là ôm gia đình.",
  },
  [normalizeText("Đây là kệ giày.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_shelf_f1b74731.wav",
    text: "Đây là kệ giày.",
  },
  [normalizeText("Từ này nghĩa là kệ giày.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_shelf_success_d9bf5901.wav",
    text: "Từ này nghĩa là kệ giày.",
  },
  [normalizeText("Mình học câu cởi giày nhé.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_take_off_shoes_a6e07c04.wav",
    text: "Mình học câu cởi giày nhé.",
  },
  [normalizeText("Câu này nghĩa là cởi giày.")]: {
    key: "lessons/afternoon-home/home-arrival/audio/vi/teach_take_off_shoes_success_a0212def.wav",
    text: "Câu này nghĩa là cởi giày.",
  },
  [normalizeText("Bé đã đi đường về nhà an toàn.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/completion_098188e6.wav",
    text: "Bé đã đi đường về nhà an toàn.",
  },
  [normalizeText("Đưa xe buýt tới ngôi nhà.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_bus_to_house_92d82ec1.wav",
    text: "Đưa xe buýt tới ngôi nhà.",
  },
  [normalizeText("Đưa xe buýt tới ngôi nhà nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_bus_to_house_fail_94403499.wav",
    text: "Đưa xe buýt tới ngôi nhà nhé.",
  },
  [normalizeText("Bé đã về tới nhà rồi!")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_bus_to_house_success_ce70a7d7.wav",
    text: "Bé đã về tới nhà rồi!",
  },
  [normalizeText("Đưa xe buýt lên con đường.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_bus_to_road_64db86d9.wav",
    text: "Đưa xe buýt lên con đường.",
  },
  [normalizeText("Đưa xe buýt xuống con đường nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_bus_to_road_fail_67eea5aa.wav",
    text: "Đưa xe buýt xuống con đường nhé.",
  },
  [normalizeText("Xe buýt đang đi trên đường.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_bus_to_road_success_5ee27143.wav",
    text: "Xe buýt đang đi trên đường.",
  },
  [normalizeText("Cài dây an toàn cho bé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_seat_belt_buckle_371e63e7.wav",
    text: "Cài dây an toàn cho bé.",
  },
  [normalizeText("Kéo dây an toàn tới chỗ ngồi nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_seat_belt_buckle_fail_a22f27a6.wav",
    text: "Kéo dây an toàn tới chỗ ngồi nhé.",
  },
  [normalizeText("Dây an toàn đã cài xong!")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_seat_belt_buckle_success_0f5315dc.wav",
    text: "Dây an toàn đã cài xong!",
  },
  [normalizeText("Đưa dây an toàn tới chỗ ngồi.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_seat_belt_to_seat_33e82cc0.wav",
    text: "Đưa dây an toàn tới chỗ ngồi.",
  },
  [normalizeText("Đưa dây an toàn tới chỗ ngồi nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_seat_belt_to_seat_fail_5a4e34ad.wav",
    text: "Đưa dây an toàn tới chỗ ngồi nhé.",
  },
  [normalizeText("Dây an toàn đã ở đúng chỗ.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/drag_seat_belt_to_seat_success_294494ec.wav",
    text: "Dây an toàn đã ở đúng chỗ.",
  },
  [normalizeText("Mình đi đường về nhà nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/intro_fde8aae4.wav",
    text: "Mình đi đường về nhà nhé.",
  },
  [normalizeText("Đường về nhà bắt đầu rồi!")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/intro_success_ccac2196.wav",
    text: "Đường về nhà bắt đầu rồi!",
  },
  [normalizeText("Chạm cửa xe để lên xe buýt.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_bus_door_da13df2a.wav",
    text: "Chạm cửa xe để lên xe buýt.",
  },
  [normalizeText("Cửa xe buýt ở bên phải thân xe đó.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_bus_door_fail_f14e4561.wav",
    text: "Cửa xe buýt ở bên phải thân xe đó.",
  },
  [normalizeText("Bé đã lên xe buýt an toàn!")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_bus_door_success_1ee7332d.wav",
    text: "Bé đã lên xe buýt an toàn!",
  },
  [normalizeText("Xe buýt ở giữa đường đó.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_bus_fail_91ec6a3d.wav",
    text: "Xe buýt ở giữa đường đó.",
  },
  [normalizeText("Đúng rồi, đó là xe buýt.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_bus_success_281dbe24.wav",
    text: "Đúng rồi, đó là xe buýt.",
  },
  [normalizeText("Chạm vào ngôi nhà nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_home_1db8b104.wav",
    text: "Chạm vào ngôi nhà nhé.",
  },
  [normalizeText("Ngôi nhà ở bên phải đó.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_home_fail_50d68336.wav",
    text: "Ngôi nhà ở bên phải đó.",
  },
  [normalizeText("Con tìm thấy nhà rồi!")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_home_success_873ddfe5.wav",
    text: "Con tìm thấy nhà rồi!",
  },
  [normalizeText("Chạm vào đèn giao thông nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_traffic_light_c77f0ce7.wav",
    text: "Chạm vào đèn giao thông nhé.",
  },
  [normalizeText("Đèn giao thông ở bên trái con đường đó.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_traffic_light_fail_1704bc70.wav",
    text: "Đèn giao thông ở bên trái con đường đó.",
  },
  [normalizeText("Con tìm thấy đèn giao thông rồi!")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_traffic_light_success_14f2abcd.wav",
    text: "Con tìm thấy đèn giao thông rồi!",
  },
  [normalizeText("Chạm vào cửa sổ nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_window_3e6bc681.wav",
    text: "Chạm vào cửa sổ nhé.",
  },
  [normalizeText("Cửa sổ nằm trên thân xe buýt đó.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_window_fail_4a56ddc3.wav",
    text: "Cửa sổ nằm trên thân xe buýt đó.",
  },
  [normalizeText("Đúng rồi, đó là cửa sổ.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/tap_window_success_a29437cb.wav",
    text: "Đúng rồi, đó là cửa sổ.",
  },
  [normalizeText("Mình học câu về tới nhà nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_arrive_home_446dc84d.wav",
    text: "Mình học câu về tới nhà nhé.",
  },
  [normalizeText("Câu này nghĩa là về tới nhà.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_arrive_home_success_5201f28a.wav",
    text: "Câu này nghĩa là về tới nhà.",
  },
  [normalizeText("Mình học câu cài dây an toàn nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_buckle_up_d9f4777f.wav",
    text: "Mình học câu cài dây an toàn nhé.",
  },
  [normalizeText("Câu này nghĩa là cài dây an toàn.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_buckle_up_success_2da1c73e.wav",
    text: "Câu này nghĩa là cài dây an toàn.",
  },
  [normalizeText("Mình học câu lên xe buýt nhé.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_get_on_bus_9de4f18d.wav",
    text: "Mình học câu lên xe buýt nhé.",
  },
  [normalizeText("Câu này nghĩa là lên xe buýt.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_get_on_bus_success_effe4f02.wav",
    text: "Câu này nghĩa là lên xe buýt.",
  },
  [normalizeText("Đây là nhà.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_home_915cefc4.wav",
    text: "Đây là nhà.",
  },
  [normalizeText("Từ này nghĩa là nhà.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_home_success_7ee90bee.wav",
    text: "Từ này nghĩa là nhà.",
  },
  [normalizeText("Đây là con đường.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_road_c932efcc.wav",
    text: "Đây là con đường.",
  },
  [normalizeText("Từ này nghĩa là con đường.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_road_success_898895c0.wav",
    text: "Từ này nghĩa là con đường.",
  },
  [normalizeText("Đây là dây an toàn.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_seat_belt_fa7e9084.wav",
    text: "Đây là dây an toàn.",
  },
  [normalizeText("Từ này nghĩa là dây an toàn.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_seat_belt_success_ee929642.wav",
    text: "Từ này nghĩa là dây an toàn.",
  },
  [normalizeText("Đây là đèn giao thông.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_traffic_light_5f5687d5.wav",
    text: "Đây là đèn giao thông.",
  },
  [normalizeText("Từ này nghĩa là đèn giao thông.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_traffic_light_success_017f7f8a.wav",
    text: "Từ này nghĩa là đèn giao thông.",
  },
  [normalizeText("Đây là cửa sổ.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_window_415c2551.wav",
    text: "Đây là cửa sổ.",
  },
  [normalizeText("Từ này nghĩa là cửa sổ.")]: {
    key: "lessons/afternoon-home/ride-home/audio/vi/teach_window_success_b93795c9.wav",
    text: "Từ này nghĩa là cửa sổ.",
  },
  [normalizeText("Bé đã làm quen với lớp học.")]: {
    key: "lessons/at-school/classroom/audio/vi/completion_044e4daa.wav",
    text: "Bé đã làm quen với lớp học.",
  },
  [normalizeText("Kéo ghế tới bàn học.")]: {
    key: "lessons/at-school/classroom/audio/vi/drag_chair_to_desk_14d4f4c9.wav",
    text: "Kéo ghế tới bàn học.",
  },
  [normalizeText("Kéo ghế tới gần bàn học nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/drag_chair_to_desk_fail_1f7d5110.wav",
    text: "Kéo ghế tới gần bàn học nhé.",
  },
  [normalizeText("Ghế đã ở cạnh bàn học rồi!")]: {
    key: "lessons/at-school/classroom/audio/vi/drag_chair_to_desk_success_f42e9063.wav",
    text: "Ghế đã ở cạnh bàn học rồi!",
  },
  [normalizeText("Mình vào lớp học nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/intro_bc40b9ff.wav",
    text: "Mình vào lớp học nhé.",
  },
  [normalizeText("Vào lớp thôi!")]: {
    key: "lessons/at-school/classroom/audio/vi/intro_success_1a75d620.wav",
    text: "Vào lớp thôi!",
  },
  [normalizeText("Chạm cô giáo lần nữa nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/review_teacher_4d00858f.wav",
    text: "Chạm cô giáo lần nữa nhé.",
  },
  [normalizeText("Cô giáo đang đứng bên trái đó.")]: {
    key: "lessons/at-school/classroom/audio/vi/review_teacher_fail_729a747b.wav",
    text: "Cô giáo đang đứng bên trái đó.",
  },
  [normalizeText("Con đã sẵn sàng học với cô giáo!")]: {
    key: "lessons/at-school/classroom/audio/vi/review_teacher_success_9b752a60.wav",
    text: "Con đã sẵn sàng học với cô giáo!",
  },
  [normalizeText("Chạm vào cái bảng nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_board_d05f24e8.wav",
    text: "Chạm vào cái bảng nhé.",
  },
  [normalizeText("Cái bảng ở phía trên lớp đó.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_board_fail_f625dd5a.wav",
    text: "Cái bảng ở phía trên lớp đó.",
  },
  [normalizeText("Con tìm thấy cái bảng rồi!")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_board_success_1c1ee403.wav",
    text: "Con tìm thấy cái bảng rồi!",
  },
  [normalizeText("Chạm cái ghế để ngồi xuống.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_chair_sit_down_b3ae9f7e.wav",
    text: "Chạm cái ghế để ngồi xuống.",
  },
  [normalizeText("Chọn cái ghế để ngồi xuống nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_chair_sit_down_fail_f3ebd9c2.wav",
    text: "Chọn cái ghế để ngồi xuống nhé.",
  },
  [normalizeText("Bé đã ngồi vào chỗ rồi!")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_chair_sit_down_success_4ae04148.wav",
    text: "Bé đã ngồi vào chỗ rồi!",
  },
  [normalizeText("Chạm vào bàn học nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_desk_aa6d315c.wav",
    text: "Chạm vào bàn học nhé.",
  },
  [normalizeText("Bàn học ở giữa lớp đó.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_desk_fail_707d754e.wav",
    text: "Bàn học ở giữa lớp đó.",
  },
  [normalizeText("Đúng rồi, đó là bàn học.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_desk_success_a734e82f.wav",
    text: "Đúng rồi, đó là bàn học.",
  },
  [normalizeText("Chạm bàn tay để giơ tay nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_hand_0aeb6a19.wav",
    text: "Chạm bàn tay để giơ tay nhé.",
  },
  [normalizeText("Bàn tay của bé ở gần vai đó.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_hand_fail_a3f59aa0.wav",
    text: "Bàn tay của bé ở gần vai đó.",
  },
  [normalizeText("Bé giơ tay rất ngoan!")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_hand_success_40f92cc4.wav",
    text: "Bé giơ tay rất ngoan!",
  },
  [normalizeText("Chạm vào cô giáo nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_teacher_2019a7a3.wav",
    text: "Chạm vào cô giáo nhé.",
  },
  [normalizeText("Cô giáo ở bên trái đó.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_teacher_fail_0e5b3d7f.wav",
    text: "Cô giáo ở bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là cô giáo.")]: {
    key: "lessons/at-school/classroom/audio/vi/tap_teacher_success_b1fb04ff.wav",
    text: "Đúng rồi, đó là cô giáo.",
  },
  [normalizeText("Đây là cái bảng.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_board_9d8286b2.wav",
    text: "Đây là cái bảng.",
  },
  [normalizeText("Từ này nghĩa là cái bảng.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_board_success_8363403e.wav",
    text: "Từ này nghĩa là cái bảng.",
  },
  [normalizeText("Đây là cái ghế.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_chair_dfdf9a61.wav",
    text: "Đây là cái ghế.",
  },
  [normalizeText("Từ này nghĩa là cái ghế.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_chair_success_bb547d2d.wav",
    text: "Từ này nghĩa là cái ghế.",
  },
  [normalizeText("Đây là lớp học.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_classroom_88c37604.wav",
    text: "Đây là lớp học.",
  },
  [normalizeText("Từ này nghĩa là lớp học.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_classroom_success_18563305.wav",
    text: "Từ này nghĩa là lớp học.",
  },
  [normalizeText("Đây là bàn học.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_desk_1892ba40.wav",
    text: "Đây là bàn học.",
  },
  [normalizeText("Từ này nghĩa là bàn học.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_desk_success_72406c97.wav",
    text: "Từ này nghĩa là bàn học.",
  },
  [normalizeText("Mình học câu giơ tay nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_raise_hand_77957cc4.wav",
    text: "Mình học câu giơ tay nhé.",
  },
  [normalizeText("Câu này nghĩa là giơ tay.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_raise_hand_success_9241993c.wav",
    text: "Câu này nghĩa là giơ tay.",
  },
  [normalizeText("Mình học câu ngồi xuống nhé.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_sit_down_4b5aff90.wav",
    text: "Mình học câu ngồi xuống nhé.",
  },
  [normalizeText("Câu này nghĩa là ngồi xuống.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_sit_down_success_6b9b89ea.wav",
    text: "Câu này nghĩa là ngồi xuống.",
  },
  [normalizeText("Đây là cô giáo.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_teacher_97594796.wav",
    text: "Đây là cô giáo.",
  },
  [normalizeText("Từ này nghĩa là cô giáo.")]: {
    key: "lessons/at-school/classroom/audio/vi/teach_teacher_success_46bf2225.wav",
    text: "Từ này nghĩa là cô giáo.",
  },
  [normalizeText("Bé đã chuẩn bị đồ dùng học tập.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/completion_6dd3ce3b.wav",
    text: "Bé đã chuẩn bị đồ dùng học tập.",
  },
  [normalizeText("Dùng bút màu vẽ hình tròn.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_crayon_to_paper_a4c8dd1c.wav",
    text: "Dùng bút màu vẽ hình tròn.",
  },
  [normalizeText("Kéo bút màu tới quyển vở nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_crayon_to_paper_fail_cd75b38f.wav",
    text: "Kéo bút màu tới quyển vở nhé.",
  },
  [normalizeText("Hình tròn đã hiện ra!")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_crayon_to_paper_success_d170c5d1.wav",
    text: "Hình tròn đã hiện ra!",
  },
  [normalizeText("Dùng bút chì viết tên nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_pencil_to_paper_74cf4e5f.wav",
    text: "Dùng bút chì viết tên nhé.",
  },
  [normalizeText("Kéo bút chì tới quyển vở nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_pencil_to_paper_fail_2823543b.wav",
    text: "Kéo bút chì tới quyển vở nhé.",
  },
  [normalizeText("Tên của con đã ở trên vở!")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_pencil_to_paper_success_c84e45a4.wav",
    text: "Tên của con đã ở trên vở!",
  },
  [normalizeText("Đặt bút chì lên bàn.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_pencil_to_table_6f987956.wav",
    text: "Đặt bút chì lên bàn.",
  },
  [normalizeText("Kéo bút chì tới mặt bàn nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_pencil_to_table_fail_aae61faa.wav",
    text: "Kéo bút chì tới mặt bàn nhé.",
  },
  [normalizeText("Bút chì đã ở trên bàn.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_pencil_to_table_success_91e29892.wav",
    text: "Bút chì đã ở trên bàn.",
  },
  [normalizeText("Đặt cái thước lên vở.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_ruler_to_paper_c3d6455b.wav",
    text: "Đặt cái thước lên vở.",
  },
  [normalizeText("Đặt cái thước lên quyển vở nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_ruler_to_paper_fail_e76cb4e8.wav",
    text: "Đặt cái thước lên quyển vở nhé.",
  },
  [normalizeText("Cái thước đã ở trên vở.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_drag_ruler_to_paper_success_5e631a1f.wav",
    text: "Cái thước đã ở trên vở.",
  },
  [normalizeText("Mình chuẩn bị đồ dùng học tập nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_intro_6ea0802e.wav",
    text: "Mình chuẩn bị đồ dùng học tập nhé.",
  },
  [normalizeText("Cùng chuẩn bị nào!")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_intro_success_3388e13b.wav",
    text: "Cùng chuẩn bị nào!",
  },
  [normalizeText("Chạm quyển sách để ôn lại nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_review_book_f8249386.wav",
    text: "Chạm quyển sách để ôn lại nhé.",
  },
  [normalizeText("Bé nhớ đồ dùng học tập rất tốt!")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_review_book_success_050ede5f.wav",
    text: "Bé nhớ đồ dùng học tập rất tốt!",
  },
  [normalizeText("Chạm vào quyển sách nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_book_00fab1f0.wav",
    text: "Chạm vào quyển sách nhé.",
  },
  [normalizeText("Quyển sách ở bên trái đó.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_book_fail_baa58424.wav",
    text: "Quyển sách ở bên trái đó.",
  },
  [normalizeText("Mở quyển sách ra nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_book_open_73a14624.wav",
    text: "Mở quyển sách ra nhé.",
  },
  [normalizeText("Chọn quyển sách để mở nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_book_open_fail_f94b1365.wav",
    text: "Chọn quyển sách để mở nhé.",
  },
  [normalizeText("Quyển sách đã mở rồi!")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_book_open_success_f3030f32.wav",
    text: "Quyển sách đã mở rồi!",
  },
  [normalizeText("Đúng rồi, đó là quyển sách.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_book_success_8b1c6ccc.wav",
    text: "Đúng rồi, đó là quyển sách.",
  },
  [normalizeText("Chạm vào bút màu nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_crayon_41a03083.wav",
    text: "Chạm vào bút màu nhé.",
  },
  [normalizeText("Bút màu ở bên phải đó.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_crayon_fail_f0c4bc0e.wav",
    text: "Bút màu ở bên phải đó.",
  },
  [normalizeText("Con tìm thấy bút màu rồi!")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_crayon_success_9c4ee1ba.wav",
    text: "Con tìm thấy bút màu rồi!",
  },
  [normalizeText("Chạm vào cục tẩy nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_eraser_f66a6774.wav",
    text: "Chạm vào cục tẩy nhé.",
  },
  [normalizeText("Cục tẩy ở phía bên phải đó.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_eraser_fail_c95eb3c4.wav",
    text: "Cục tẩy ở phía bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là cục tẩy.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_tap_eraser_success_a2349059.wav",
    text: "Đúng rồi, đó là cục tẩy.",
  },
  [normalizeText("Đây là bút màu.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_crayon_0b9c3baa.wav",
    text: "Đây là bút màu.",
  },
  [normalizeText("Từ này nghĩa là bút màu.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_crayon_success_44645d5d.wav",
    text: "Từ này nghĩa là bút màu.",
  },
  [normalizeText("Mình học câu vẽ hình tròn nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_draw_circle_42c057b1.wav",
    text: "Mình học câu vẽ hình tròn nhé.",
  },
  [normalizeText("Câu này nghĩa là vẽ hình tròn.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_draw_circle_success_e0f1da4f.wav",
    text: "Câu này nghĩa là vẽ hình tròn.",
  },
  [normalizeText("Đây là cục tẩy.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_eraser_3d4667ff.wav",
    text: "Đây là cục tẩy.",
  },
  [normalizeText("Từ này nghĩa là cục tẩy.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_eraser_success_dd22fdff.wav",
    text: "Từ này nghĩa là cục tẩy.",
  },
  [normalizeText("Đây là quyển vở.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_notebook_2085f4c4.wav",
    text: "Đây là quyển vở.",
  },
  [normalizeText("Từ này nghĩa là quyển vở.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_notebook_success_f7891ad1.wav",
    text: "Từ này nghĩa là quyển vở.",
  },
  [normalizeText("Mình học câu mở sách nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_open_book_ecceee0d.wav",
    text: "Mình học câu mở sách nhé.",
  },
  [normalizeText("Câu này nghĩa là mở sách.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_open_book_success_06265992.wav",
    text: "Câu này nghĩa là mở sách.",
  },
  [normalizeText("Đây là bút chì.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_pencil_ff4a3ca9.wav",
    text: "Đây là bút chì.",
  },
  [normalizeText("Từ này nghĩa là bút chì.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_pencil_success_8a387e6d.wav",
    text: "Từ này nghĩa là bút chì.",
  },
  [normalizeText("Đây là cái thước.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_ruler_864abf91.wav",
    text: "Đây là cái thước.",
  },
  [normalizeText("Từ này nghĩa là cái thước.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_ruler_success_c98d7893.wav",
    text: "Từ này nghĩa là cái thước.",
  },
  [normalizeText("Mình học câu viết tên của con nhé.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_write_name_eae0ed6e.wav",
    text: "Mình học câu viết tên của con nhé.",
  },
  [normalizeText("Câu này nghĩa là viết tên của con.")]: {
    key: "lessons/at-school/school-supplies/audio/vi/supplies_teach_write_name_success_7128066a.wav",
    text: "Câu này nghĩa là viết tên của con.",
  },
  [normalizeText("Bé đã làm theo cô giáo thật tốt.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/completion_2f953c29.wav",
    text: "Bé đã làm theo cô giáo thật tốt.",
  },
  [normalizeText("Cất quyển sách vào hộp.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_book_to_box_4704db1f.wav",
    text: "Cất quyển sách vào hộp.",
  },
  [normalizeText("Kéo sách vào hộp để dọn đồ nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_book_to_box_fail_4f21d308.wav",
    text: "Kéo sách vào hộp để dọn đồ nhé.",
  },
  [normalizeText("Sách đã được cất gọn.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_book_to_box_success_7871a3ff.wav",
    text: "Sách đã được cất gọn.",
  },
  [normalizeText("Đặt quyển sách lên bàn.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_book_to_desk_e8de7569.wav",
    text: "Đặt quyển sách lên bàn.",
  },
  [normalizeText("Đặt sách lên bàn nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_book_to_desk_fail_22ffac5f.wav",
    text: "Đặt sách lên bàn nhé.",
  },
  [normalizeText("Sách đã ở trên bàn.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_book_to_desk_success_ef1868bf.wav",
    text: "Sách đã ở trên bàn.",
  },
  [normalizeText("Bé đã vẽ hình tròn rồi!")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_crayon_to_paper_success_c25e89a9.wav",
    text: "Bé đã vẽ hình tròn rồi!",
  },
  [normalizeText("Cất bút chì vào hộp.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_box_b3f5d272.wav",
    text: "Cất bút chì vào hộp.",
  },
  [normalizeText("Kéo bút chì vào hộp để dọn đồ nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_box_fail_f1c77a00.wav",
    text: "Kéo bút chì vào hộp để dọn đồ nhé.",
  },
  [normalizeText("Bút chì đã được cất gọn.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_box_success_22dbc564.wav",
    text: "Bút chì đã được cất gọn.",
  },
  [normalizeText("Đặt bút chì lên vở.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_notebook_79398ef6.wav",
    text: "Đặt bút chì lên vở.",
  },
  [normalizeText("Bút chì đã sẵn sàng để viết.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_notebook_success_034e477a.wav",
    text: "Bút chì đã sẵn sàng để viết.",
  },
  [normalizeText("Dùng bút chì viết tên.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_paper_31880481.wav",
    text: "Dùng bút chì viết tên.",
  },
  [normalizeText("Bé đã viết tên rồi!")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_drag_pencil_to_paper_success_b1b6e3f0.wav",
    text: "Bé đã viết tên rồi!",
  },
  [normalizeText("Cô giáo sẽ hướng dẫn bé nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_intro_6b1db001.wav",
    text: "Cô giáo sẽ hướng dẫn bé nhé.",
  },
  [normalizeText("Mình cùng lắng nghe nào.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_intro_success_4132ce42.wav",
    text: "Mình cùng lắng nghe nào.",
  },
  [normalizeText("Chạm cô giáo để kết thúc nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_review_teacher_3b30a36c.wav",
    text: "Chạm cô giáo để kết thúc nhé.",
  },
  [normalizeText("Bé đã làm theo cô giáo rất tốt!")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_review_teacher_success_fe0d3c71.wav",
    text: "Bé đã làm theo cô giáo rất tốt!",
  },
  [normalizeText("Mở quyển sách theo lời cô.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_book_open_10b9b3f1.wav",
    text: "Mở quyển sách theo lời cô.",
  },
  [normalizeText("Bé mở sách đúng rồi!")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_book_open_success_d6415955.wav",
    text: "Bé mở sách đúng rồi!",
  },
  [normalizeText("Chạm bàn tay để giơ tay.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_hand_90ee24b8.wav",
    text: "Chạm bàn tay để giơ tay.",
  },
  [normalizeText("Bàn tay của bé ở phía trên đó.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_hand_fail_225db70c.wav",
    text: "Bàn tay của bé ở phía trên đó.",
  },
  [normalizeText("Chạm vào bút chì nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_pencil_b178e407.wav",
    text: "Chạm vào bút chì nhé.",
  },
  [normalizeText("Bút chì ở trên bàn đó.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_pencil_fail_ac9931ea.wav",
    text: "Bút chì ở trên bàn đó.",
  },
  [normalizeText("Con tìm thấy bút chì rồi!")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_pencil_success_33884482.wav",
    text: "Con tìm thấy bút chì rồi!",
  },
  [normalizeText("Chạm cô giáo để lắng nghe.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_teacher_listen_5f4aa800.wav",
    text: "Chạm cô giáo để lắng nghe.",
  },
  [normalizeText("Chạm cô giáo để lắng nghe nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_teacher_listen_fail_03ab0485.wav",
    text: "Chạm cô giáo để lắng nghe nhé.",
  },
  [normalizeText("Bé lắng nghe rất tốt!")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_tap_teacher_listen_success_3c107a52.wav",
    text: "Bé lắng nghe rất tốt!",
  },
  [normalizeText("Cuối giờ mình học câu dọn đồ nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_clean_up_877fa132.wav",
    text: "Cuối giờ mình học câu dọn đồ nhé.",
  },
  [normalizeText("Câu này nghĩa là dọn đồ.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_clean_up_success_cc03534d.wav",
    text: "Câu này nghĩa là dọn đồ.",
  },
  [normalizeText("Cô giáo bảo mình vẽ hình tròn.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_draw_circle_c914289e.wav",
    text: "Cô giáo bảo mình vẽ hình tròn.",
  },
  [normalizeText("Mình học từ lắng nghe nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_listen_7601fcd6.wav",
    text: "Mình học từ lắng nghe nhé.",
  },
  [normalizeText("Từ này nghĩa là lắng nghe.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_listen_success_8a11979b.wav",
    text: "Từ này nghĩa là lắng nghe.",
  },
  [normalizeText("Cô giáo bảo mình mở sách nhé.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_open_book_c0f5726b.wav",
    text: "Cô giáo bảo mình mở sách nhé.",
  },
  [normalizeText("Cô giáo bảo mình giơ tay.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_raise_hand_ddc0b889.wav",
    text: "Cô giáo bảo mình giơ tay.",
  },
  [normalizeText("Cô giáo bảo mình viết tên.")]: {
    key: "lessons/at-school/teacher-instructions/audio/vi/instructions_teach_write_name_4c7a1d0f.wav",
    text: "Cô giáo bảo mình viết tên.",
  },
  [normalizeText("Bé đã chọn truyện trước khi ngủ thật nhẹ nhàng!")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/completion_abb65d71.wav",
    text: "Bé đã chọn truyện trước khi ngủ thật nhẹ nhàng!",
  },
  [normalizeText("Chọn một truyện cho giờ đi ngủ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_choose_story_322624c3.wav",
    text: "Chọn một truyện cho giờ đi ngủ.",
  },
  [normalizeText("Kéo sách truyện vào góc đọc để chọn truyện nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_choose_story_fail_72f522a6.wav",
    text: "Kéo sách truyện vào góc đọc để chọn truyện nhé.",
  },
  [normalizeText("Bé đã chọn truyện xong rồi.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_choose_story_success_d1bf13f5.wav",
    text: "Bé đã chọn truyện xong rồi.",
  },
  [normalizeText("Gắn miếng đánh dấu trang vào sách truyện.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_page_tab_91dab556.wav",
    text: "Gắn miếng đánh dấu trang vào sách truyện.",
  },
  [normalizeText("Kéo miếng đánh dấu trang tới sách truyện nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_page_tab_fail_c987407c.wav",
    text: "Kéo miếng đánh dấu trang tới sách truyện nhé.",
  },
  [normalizeText("Miếng đánh dấu trang đã nằm đúng chỗ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_page_tab_success_a2061213.wav",
    text: "Miếng đánh dấu trang đã nằm đúng chỗ.",
  },
  [normalizeText("Đặt thẻ đánh dấu vào trang đang đọc.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_place_bookmark_86efaaaf.wav",
    text: "Đặt thẻ đánh dấu vào trang đang đọc.",
  },
  [normalizeText("Kéo thẻ đánh dấu vào trang sách nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_place_bookmark_fail_23c6505f.wav",
    text: "Kéo thẻ đánh dấu vào trang sách nhé.",
  },
  [normalizeText("Thẻ đánh dấu đã nằm trong sách.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_place_bookmark_success_5231299a.wav",
    text: "Thẻ đánh dấu đã nằm trong sách.",
  },
  [normalizeText("Đưa sách truyện tới góc đọc yên tĩnh.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_storybook_to_nook_0ad7f974.wav",
    text: "Đưa sách truyện tới góc đọc yên tĩnh.",
  },
  [normalizeText("Kéo sách truyện tới góc đọc yên tĩnh nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_storybook_to_nook_fail_0667e98f.wav",
    text: "Kéo sách truyện tới góc đọc yên tĩnh nhé.",
  },
  [normalizeText("Sách truyện đã ở góc đọc yên tĩnh.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/drag_storybook_to_nook_success_c96e5ef4.wav",
    text: "Sách truyện đã ở góc đọc yên tĩnh.",
  },
  [normalizeText("Đến giờ ngủ rồi, mình chọn truyện thật nhẹ nhàng nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/intro_e1d1f72e.wav",
    text: "Đến giờ ngủ rồi, mình chọn truyện thật nhẹ nhàng nhé.",
  },
  [normalizeText("Một câu chuyện êm dịu giúp bé chuẩn bị ngủ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/intro_success_5f7db0ef.wav",
    text: "Một câu chuyện êm dịu giúp bé chuẩn bị ngủ.",
  },
  [normalizeText("Chạm vào thẻ đánh dấu trang nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_bookmark_6626e61c.wav",
    text: "Chạm vào thẻ đánh dấu trang nhé.",
  },
  [normalizeText("Thẻ đánh dấu trang nằm cạnh sách truyện đó.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_bookmark_fail_0c044e84.wav",
    text: "Thẻ đánh dấu trang nằm cạnh sách truyện đó.",
  },
  [normalizeText("Đúng rồi, đó là thẻ đánh dấu trang.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_bookmark_success_a1c321c1.wav",
    text: "Đúng rồi, đó là thẻ đánh dấu trang.",
  },
  [normalizeText("Đọc khẽ câu chuyện trước khi ngủ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_read_softly_ae48c9ec.wav",
    text: "Đọc khẽ câu chuyện trước khi ngủ.",
  },
  [normalizeText("Chạm vào thẻ giọng nói nhẹ nhàng nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_read_softly_fail_cd0d78a0.wav",
    text: "Chạm vào thẻ giọng nói nhẹ nhàng nhé.",
  },
  [normalizeText("Giọng đọc thật êm, bé đã sẵn sàng thư giãn.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_read_softly_success_e0f5cf95.wav",
    text: "Giọng đọc thật êm, bé đã sẵn sàng thư giãn.",
  },
  [normalizeText("Chạm vào giọng nói nhẹ nhàng nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_soft_voice_24b1bbbb.wav",
    text: "Chạm vào giọng nói nhẹ nhàng nhé.",
  },
  [normalizeText("Thẻ giọng nói nhẹ nhàng ở bên trái đó.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_soft_voice_fail_13825fb6.wav",
    text: "Thẻ giọng nói nhẹ nhàng ở bên trái đó.",
  },
  [normalizeText("Đúng rồi, mình đọc bằng giọng thật nhẹ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_soft_voice_success_1553ce68.wav",
    text: "Đúng rồi, mình đọc bằng giọng thật nhẹ.",
  },
  [normalizeText("Chạm vào kệ truyện nhỏ nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_story_shelf_29b0fb97.wav",
    text: "Chạm vào kệ truyện nhỏ nhé.",
  },
  [normalizeText("Kệ truyện nhỏ ở phía trên bên phải đó.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_story_shelf_fail_c08d2efb.wav",
    text: "Kệ truyện nhỏ ở phía trên bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là kệ truyện nhỏ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_story_shelf_success_9cfed968.wav",
    text: "Đúng rồi, đó là kệ truyện nhỏ.",
  },
  [normalizeText("Chạm vào sách truyện trước giờ ngủ nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_storybook_c30cce3e.wav",
    text: "Chạm vào sách truyện trước giờ ngủ nhé.",
  },
  [normalizeText("Sách truyện nằm trên bàn nhỏ đó.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_storybook_fail_76e6d271.wav",
    text: "Sách truyện nằm trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là sách truyện.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/tap_storybook_success_2b13fa98.wav",
    text: "Đúng rồi, đó là sách truyện.",
  },
  [normalizeText("Đây là thẻ đánh dấu trang.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_bookmark_2bec4a58.wav",
    text: "Đây là thẻ đánh dấu trang.",
  },
  [normalizeText("Từ này nghĩa là thẻ đánh dấu trang.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_bookmark_success_3ec7bd94.wav",
    text: "Từ này nghĩa là thẻ đánh dấu trang.",
  },
  [normalizeText("Mình học câu chọn truyện nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_choose_story_564db4fe.wav",
    text: "Mình học câu chọn truyện nhé.",
  },
  [normalizeText("Chọn truyện xong thì mình đọc thật khẽ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_choose_story_success_a85fcd1a.wav",
    text: "Chọn truyện xong thì mình đọc thật khẽ.",
  },
  [normalizeText("Đây là miếng đánh dấu trang nhỏ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_page_tab_3b03770e.wav",
    text: "Đây là miếng đánh dấu trang nhỏ.",
  },
  [normalizeText("Từ này nghĩa là miếng đánh dấu trang nhỏ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_page_tab_success_cfa6377c.wav",
    text: "Từ này nghĩa là miếng đánh dấu trang nhỏ.",
  },
  [normalizeText("Mình học câu đặt thẻ đánh dấu nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_place_bookmark_24f59bb2.wav",
    text: "Mình học câu đặt thẻ đánh dấu nhé.",
  },
  [normalizeText("Đặt thẻ đánh dấu để lần sau biết đọc tiếp ở đâu.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_place_bookmark_success_c3e77bdb.wav",
    text: "Đặt thẻ đánh dấu để lần sau biết đọc tiếp ở đâu.",
  },
  [normalizeText("Mình học câu đọc khẽ nhé.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_read_softly_401256ea.wav",
    text: "Mình học câu đọc khẽ nhé.",
  },
  [normalizeText("Đọc khẽ giúp căn phòng giữ được không khí yên tĩnh.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_read_softly_success_ac095fa7.wav",
    text: "Đọc khẽ giúp căn phòng giữ được không khí yên tĩnh.",
  },
  [normalizeText("Đây là góc đọc yên tĩnh.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_reading_nook_06383ed1.wav",
    text: "Đây là góc đọc yên tĩnh.",
  },
  [normalizeText("Từ này nghĩa là góc đọc yên tĩnh.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_reading_nook_success_a1e97265.wav",
    text: "Từ này nghĩa là góc đọc yên tĩnh.",
  },
  [normalizeText("Đây là giọng nói nhẹ nhàng.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_soft_voice_04df6715.wav",
    text: "Đây là giọng nói nhẹ nhàng.",
  },
  [normalizeText("Cụm này nghĩa là giọng nói nhẹ nhàng.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_soft_voice_success_d99798ae.wav",
    text: "Cụm này nghĩa là giọng nói nhẹ nhàng.",
  },
  [normalizeText("Đây là kệ truyện nhỏ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_story_shelf_5c5a80ac.wav",
    text: "Đây là kệ truyện nhỏ.",
  },
  [normalizeText("Cụm này nghĩa là kệ truyện nhỏ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_story_shelf_success_060db2b0.wav",
    text: "Cụm này nghĩa là kệ truyện nhỏ.",
  },
  [normalizeText("Đây là sách truyện trước giờ ngủ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_storybook_242841cc.wav",
    text: "Đây là sách truyện trước giờ ngủ.",
  },
  [normalizeText("Từ này nghĩa là sách truyện trước giờ ngủ.")]: {
    key: "lessons/bedtime/bedtime-story/audio/vi/teach_storybook_success_94e9af4c.wav",
    text: "Từ này nghĩa là sách truyện trước giờ ngủ.",
  },
  [normalizeText("Bé đã làm căn phòng dịu xuống để chuẩn bị ngủ!")]: {
    key: "lessons/bedtime/calm-room/audio/vi/completion_4b8234fd.wav",
    text: "Bé đã làm căn phòng dịu xuống để chuẩn bị ngủ!",
  },
  [normalizeText("Kéo rèm cửa lại.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_close_curtains_f7a721d4.wav",
    text: "Kéo rèm cửa lại.",
  },
  [normalizeText("Kéo rèm cửa vào khung cửa sổ nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_close_curtains_fail_a8244998.wav",
    text: "Kéo rèm cửa vào khung cửa sổ nhé.",
  },
  [normalizeText("Rèm cửa đã được kéo lại.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_close_curtains_success_799e5d66.wav",
    text: "Rèm cửa đã được kéo lại.",
  },
  [normalizeText("Đặt máy tạo ẩm vào góc phòng.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_humidifier_dbcf6837.wav",
    text: "Đặt máy tạo ẩm vào góc phòng.",
  },
  [normalizeText("Kéo máy tạo ẩm vào vùng cạnh giường nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_humidifier_fail_484ad989.wav",
    text: "Kéo máy tạo ẩm vào vùng cạnh giường nhé.",
  },
  [normalizeText("Máy tạo ẩm đã ở đúng góc.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_humidifier_success_bf269528.wav",
    text: "Máy tạo ẩm đã ở đúng góc.",
  },
  [normalizeText("Đặt máy phát âm thanh ở góc yên tĩnh.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_sound_machine_c2d0a429.wav",
    text: "Đặt máy phát âm thanh ở góc yên tĩnh.",
  },
  [normalizeText("Kéo máy phát âm thanh tới góc yên tĩnh nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_sound_machine_fail_f304e280.wav",
    text: "Kéo máy phát âm thanh tới góc yên tĩnh nhé.",
  },
  [normalizeText("Máy phát âm thanh đã ở đúng chỗ.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/drag_sound_machine_success_2914bf25.wav",
    text: "Máy phát âm thanh đã ở đúng chỗ.",
  },
  [normalizeText("Căn phòng cần dịu lại để bé dễ ngủ hơn.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/intro_f3f04c87.wav",
    text: "Căn phòng cần dịu lại để bé dễ ngủ hơn.",
  },
  [normalizeText("Ánh sáng dịu và âm thanh êm giúp giờ ngủ nhẹ hơn.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/intro_success_97d54248.wav",
    text: "Ánh sáng dịu và âm thanh êm giúp giờ ngủ nhẹ hơn.",
  },
  [normalizeText("Chạm vào rèm cửa nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_curtain_2c9584a7.wav",
    text: "Chạm vào rèm cửa nhé.",
  },
  [normalizeText("Rèm cửa ở phía bên phải đó.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_curtain_fail_36a98f1e.wav",
    text: "Rèm cửa ở phía bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là rèm cửa.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_curtain_success_bfb94d28.wav",
    text: "Đúng rồi, đó là rèm cửa.",
  },
  [normalizeText("Làm đèn dịu xuống.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_dim_lights_aba70d7e.wav",
    text: "Làm đèn dịu xuống.",
  },
  [normalizeText("Ánh sáng đã dịu hơn rồi.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_dim_lights_success_4d43ef02.wav",
    text: "Ánh sáng đã dịu hơn rồi.",
  },
  [normalizeText("Chạm vào bài hát ru nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_lullaby_e50e2707.wav",
    text: "Chạm vào bài hát ru nhé.",
  },
  [normalizeText("Thẻ bài hát ru nằm phía trên đó.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_lullaby_fail_e6268254.wav",
    text: "Thẻ bài hát ru nằm phía trên đó.",
  },
  [normalizeText("Đúng rồi, đó là bài hát ru.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_lullaby_success_6ae869d0.wav",
    text: "Đúng rồi, đó là bài hát ru.",
  },
  [normalizeText("Chạm vào đèn ngủ dịu nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_night_light_a0321f77.wav",
    text: "Chạm vào đèn ngủ dịu nhé.",
  },
  [normalizeText("Đèn ngủ dịu ở gần giữa phòng đó.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_night_light_fail_6acaabbd.wav",
    text: "Đèn ngủ dịu ở gần giữa phòng đó.",
  },
  [normalizeText("Đúng rồi, đó là đèn ngủ dịu.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_night_light_success_08cba209.wav",
    text: "Đúng rồi, đó là đèn ngủ dịu.",
  },
  [normalizeText("Bật bài hát ru thật nhỏ.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_play_lullaby_3d1607c5.wav",
    text: "Bật bài hát ru thật nhỏ.",
  },
  [normalizeText("Chạm vào máy phát âm thanh ru ngủ nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_play_lullaby_fail_a35fe98e.wav",
    text: "Chạm vào máy phát âm thanh ru ngủ nhé.",
  },
  [normalizeText("Bài hát ru đã bật thật êm.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_play_lullaby_success_1e1adf63.wav",
    text: "Bài hát ru đã bật thật êm.",
  },
  [normalizeText("Chạm vào máy chiếu sao nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_star_projector_63fc4754.wav",
    text: "Chạm vào máy chiếu sao nhé.",
  },
  [normalizeText("Máy chiếu sao nằm bên trái đó.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_star_projector_fail_b7430b20.wav",
    text: "Máy chiếu sao nằm bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là máy chiếu sao.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/tap_star_projector_success_6f981054.wav",
    text: "Đúng rồi, đó là máy chiếu sao.",
  },
  [normalizeText("Mình học câu kéo rèm lại nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_close_curtains_9e26386a.wav",
    text: "Mình học câu kéo rèm lại nhé.",
  },
  [normalizeText("Kéo rèm lại giúp căn phòng yên và tối hơn.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_close_curtains_success_4a00c1f3.wav",
    text: "Kéo rèm lại giúp căn phòng yên và tối hơn.",
  },
  [normalizeText("Đây là rèm cửa.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_curtain_f7acbe2c.wav",
    text: "Đây là rèm cửa.",
  },
  [normalizeText("Từ này nghĩa là rèm cửa.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_curtain_success_763a0f4c.wav",
    text: "Từ này nghĩa là rèm cửa.",
  },
  [normalizeText("Mình học câu làm đèn dịu xuống nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_dim_lights_61bd6500.wav",
    text: "Mình học câu làm đèn dịu xuống nhé.",
  },
  [normalizeText("Làm đèn dịu xuống giúp mắt bé thư giãn.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_dim_lights_success_097bccde.wav",
    text: "Làm đèn dịu xuống giúp mắt bé thư giãn.",
  },
  [normalizeText("Đây là máy tạo ẩm.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_humidifier_b3150073.wav",
    text: "Đây là máy tạo ẩm.",
  },
  [normalizeText("Từ này nghĩa là máy tạo ẩm.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_humidifier_success_09bed82f.wav",
    text: "Từ này nghĩa là máy tạo ẩm.",
  },
  [normalizeText("Đây là bài hát ru.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_lullaby_75735ad3.wav",
    text: "Đây là bài hát ru.",
  },
  [normalizeText("Từ này nghĩa là bài hát ru.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_lullaby_success_7581caad.wav",
    text: "Từ này nghĩa là bài hát ru.",
  },
  [normalizeText("Đây là đèn ngủ dịu.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_night_light_07f0a76b.wav",
    text: "Đây là đèn ngủ dịu.",
  },
  [normalizeText("Cụm này nghĩa là đèn ngủ dịu.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_night_light_success_3f1036df.wav",
    text: "Cụm này nghĩa là đèn ngủ dịu.",
  },
  [normalizeText("Mình học câu bật bài hát ru nhé.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_play_lullaby_da39895c.wav",
    text: "Mình học câu bật bài hát ru nhé.",
  },
  [normalizeText("Bài hát ru nhẹ nhàng giúp bé chậm lại.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_play_lullaby_success_749eb3c3.wav",
    text: "Bài hát ru nhẹ nhàng giúp bé chậm lại.",
  },
  [normalizeText("Đây là máy phát âm thanh ru ngủ.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_sound_machine_df334462.wav",
    text: "Đây là máy phát âm thanh ru ngủ.",
  },
  [normalizeText("Cụm này nghĩa là máy phát âm thanh ru ngủ.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_sound_machine_success_2a362b74.wav",
    text: "Cụm này nghĩa là máy phát âm thanh ru ngủ.",
  },
  [normalizeText("Đây là máy chiếu sao.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_star_projector_11c29d22.wav",
    text: "Đây là máy chiếu sao.",
  },
  [normalizeText("Cụm này nghĩa là máy chiếu sao.")]: {
    key: "lessons/bedtime/calm-room/audio/vi/teach_star_projector_success_2a516161.wav",
    text: "Cụm này nghĩa là máy chiếu sao.",
  },
  [normalizeText("Bé đã sẵn sàng vào giấc ngủ thật êm!")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/completion_2c8777a7.wav",
    text: "Bé đã sẵn sàng vào giấc ngủ thật êm!",
  },
  [normalizeText("Dán miếng phát sáng lên tường.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_glow_sticker_f5115281.wav",
    text: "Dán miếng phát sáng lên tường.",
  },
  [normalizeText("Kéo miếng dán phát sáng lên mảng tường nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_glow_sticker_fail_5fe483f2.wav",
    text: "Kéo miếng dán phát sáng lên mảng tường nhé.",
  },
  [normalizeText("Miếng dán đã phát sáng thật nhẹ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_glow_sticker_success_b06789d5.wav",
    text: "Miếng dán đã phát sáng thật nhẹ.",
  },
  [normalizeText("Ôm thú bông ngủ thật nhẹ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_hug_comfort_plush_96c9d599.wav",
    text: "Ôm thú bông ngủ thật nhẹ.",
  },
  [normalizeText("Kéo thú bông ôm ngủ tới bé nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_hug_comfort_plush_fail_c1f4dcaf.wav",
    text: "Kéo thú bông ôm ngủ tới bé nhé.",
  },
  [normalizeText("Bé đã ôm thú bông thật êm.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_hug_comfort_plush_success_320331f1.wav",
    text: "Bé đã ôm thú bông thật êm.",
  },
  [normalizeText("Đặt mặt nạ ngủ lên bàn nhỏ cạnh giường.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_mask_to_nightstand_20d203a4.wav",
    text: "Đặt mặt nạ ngủ lên bàn nhỏ cạnh giường.",
  },
  [normalizeText("Kéo mặt nạ ngủ tới bàn nhỏ cạnh giường nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_mask_to_nightstand_fail_e507b6e6.wav",
    text: "Kéo mặt nạ ngủ tới bàn nhỏ cạnh giường nhé.",
  },
  [normalizeText("Mặt nạ ngủ đã ở trên bàn nhỏ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_mask_to_nightstand_success_cdf9cf63.wav",
    text: "Mặt nạ ngủ đã ở trên bàn nhỏ.",
  },
  [normalizeText("Đeo mặt nạ ngủ cho bé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_wear_sleep_mask_96f106e3.wav",
    text: "Đeo mặt nạ ngủ cho bé.",
  },
  [normalizeText("Kéo mặt nạ ngủ tới bé nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_wear_sleep_mask_fail_3dd0c96d.wav",
    text: "Kéo mặt nạ ngủ tới bé nhé.",
  },
  [normalizeText("Mặt nạ ngủ đã được đeo nhẹ nhàng.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/drag_wear_sleep_mask_success_89d277da.wav",
    text: "Mặt nạ ngủ đã được đeo nhẹ nhàng.",
  },
  [normalizeText("Căn phòng đã dịu rồi, mình chuẩn bị vào giấc nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/intro_8269f29d.wav",
    text: "Căn phòng đã dịu rồi, mình chuẩn bị vào giấc nhé.",
  },
  [normalizeText("Từng việc nhỏ giúp cơ thể biết đã đến giờ ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/intro_success_4f6308e4.wav",
    text: "Từng việc nhỏ giúp cơ thể biết đã đến giờ ngủ.",
  },
  [normalizeText("Xem sổ ghi giấc mơ lần cuối.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_check_dream_journal_c94b6fcf.wav",
    text: "Xem sổ ghi giấc mơ lần cuối.",
  },
  [normalizeText("Sổ đã được xem xong, đến giờ ngủ rồi.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_check_dream_journal_success_d593d1c3.wav",
    text: "Sổ đã được xem xong, đến giờ ngủ rồi.",
  },
  [normalizeText("Chạm vào thú bông ôm ngủ nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_comfort_plush_e7f5ceac.wav",
    text: "Chạm vào thú bông ôm ngủ nhé.",
  },
  [normalizeText("Thú bông ôm ngủ nằm cạnh mặt nạ ngủ đó.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_comfort_plush_fail_466714a6.wav",
    text: "Thú bông ôm ngủ nằm cạnh mặt nạ ngủ đó.",
  },
  [normalizeText("Đúng rồi, đó là thú bông ôm ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_comfort_plush_success_75d1df6e.wav",
    text: "Đúng rồi, đó là thú bông ôm ngủ.",
  },
  [normalizeText("Chạm vào sổ ghi giấc mơ nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_dream_journal_453eefac.wav",
    text: "Chạm vào sổ ghi giấc mơ nhé.",
  },
  [normalizeText("Sổ ghi giấc mơ nằm trên bàn nhỏ đó.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_dream_journal_fail_c3842871.wav",
    text: "Sổ ghi giấc mơ nằm trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là sổ ghi giấc mơ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_dream_journal_success_a73ce8d6.wav",
    text: "Đúng rồi, đó là sổ ghi giấc mơ.",
  },
  [normalizeText("Chạm vào đồ treo hình mặt trăng nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_moon_mobile_ec211c02.wav",
    text: "Chạm vào đồ treo hình mặt trăng nhé.",
  },
  [normalizeText("Đồ treo hình mặt trăng ở phía trên đó.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_moon_mobile_fail_d108a956.wav",
    text: "Đồ treo hình mặt trăng ở phía trên đó.",
  },
  [normalizeText("Đúng rồi, đó là đồ treo hình mặt trăng.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_moon_mobile_success_1d805123.wav",
    text: "Đúng rồi, đó là đồ treo hình mặt trăng.",
  },
  [normalizeText("Chạm vào mặt nạ ngủ nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_sleep_mask_0f783ad2.wav",
    text: "Chạm vào mặt nạ ngủ nhé.",
  },
  [normalizeText("Mặt nạ ngủ nằm ở giữa phòng đó.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_sleep_mask_fail_ac87a331.wav",
    text: "Mặt nạ ngủ nằm ở giữa phòng đó.",
  },
  [normalizeText("Đúng rồi, đó là mặt nạ ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/tap_sleep_mask_success_16945653.wav",
    text: "Đúng rồi, đó là mặt nạ ngủ.",
  },
  [normalizeText("Mình học câu xem sổ ghi giấc mơ nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_check_dream_journal_906a0747.wav",
    text: "Mình học câu xem sổ ghi giấc mơ nhé.",
  },
  [normalizeText("Xem sổ một chút rồi đặt lại để ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_check_dream_journal_success_84ff9eed.wav",
    text: "Xem sổ một chút rồi đặt lại để ngủ.",
  },
  [normalizeText("Đây là thú bông ôm ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_comfort_plush_53fe4623.wav",
    text: "Đây là thú bông ôm ngủ.",
  },
  [normalizeText("Cụm này nghĩa là thú bông ôm ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_comfort_plush_success_8799809b.wav",
    text: "Cụm này nghĩa là thú bông ôm ngủ.",
  },
  [normalizeText("Đây là sổ ghi giấc mơ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_dream_journal_533f805d.wav",
    text: "Đây là sổ ghi giấc mơ.",
  },
  [normalizeText("Cụm này nghĩa là sổ ghi giấc mơ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_dream_journal_success_4867d764.wav",
    text: "Cụm này nghĩa là sổ ghi giấc mơ.",
  },
  [normalizeText("Đây là miếng dán phát sáng.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_glow_sticker_fe1f0c28.wav",
    text: "Đây là miếng dán phát sáng.",
  },
  [normalizeText("Cụm này nghĩa là miếng dán phát sáng.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_glow_sticker_success_59d1b48c.wav",
    text: "Cụm này nghĩa là miếng dán phát sáng.",
  },
  [normalizeText("Mình học câu ôm thú bông ngủ nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_hug_comfort_plush_17570973.wav",
    text: "Mình học câu ôm thú bông ngủ nhé.",
  },
  [normalizeText("Ôm thú bông giúp bé thấy an toàn hơn.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_hug_comfort_plush_success_d73a76d0.wav",
    text: "Ôm thú bông giúp bé thấy an toàn hơn.",
  },
  [normalizeText("Đây là đồ treo hình mặt trăng.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_moon_mobile_1fc37c44.wav",
    text: "Đây là đồ treo hình mặt trăng.",
  },
  [normalizeText("Cụm này nghĩa là đồ treo hình mặt trăng.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_moon_mobile_success_2f149b49.wav",
    text: "Cụm này nghĩa là đồ treo hình mặt trăng.",
  },
  [normalizeText("Đây là bàn nhỏ cạnh giường.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_nightstand_08e25443.wav",
    text: "Đây là bàn nhỏ cạnh giường.",
  },
  [normalizeText("Từ này nghĩa là bàn nhỏ cạnh giường.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_nightstand_success_d19f3e3e.wav",
    text: "Từ này nghĩa là bàn nhỏ cạnh giường.",
  },
  [normalizeText("Đây là mặt nạ ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_sleep_mask_3d90bae2.wav",
    text: "Đây là mặt nạ ngủ.",
  },
  [normalizeText("Cụm này nghĩa là mặt nạ ngủ.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_sleep_mask_success_88c335d4.wav",
    text: "Cụm này nghĩa là mặt nạ ngủ.",
  },
  [normalizeText("Mình học câu đeo mặt nạ ngủ nhé.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_wear_sleep_mask_8b5ce2e1.wav",
    text: "Mình học câu đeo mặt nạ ngủ nhé.",
  },
  [normalizeText("Đeo mặt nạ ngủ giúp mắt được nghỉ ngơi.")]: {
    key: "lessons/bedtime/sleep-ready/audio/vi/teach_wear_sleep_mask_success_ae9ee71c.wav",
    text: "Đeo mặt nạ ngủ giúp mắt được nghỉ ngơi.",
  },
  [normalizeText("Bé đã dọn sau bữa tối thật gọn gàng!")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/completion_71b7e470.wav",
    text: "Bé đã dọn sau bữa tối thật gọn gàng!",
  },
  [normalizeText("Đậy phần đồ ăn còn lại.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_cover_to_leftovers_f00843ed.wav",
    text: "Đậy phần đồ ăn còn lại.",
  },
  [normalizeText("Kéo nắp đậy tới đồ ăn còn lại nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_cover_to_leftovers_fail_1a7def0b.wav",
    text: "Kéo nắp đậy tới đồ ăn còn lại nhé.",
  },
  [normalizeText("Đồ ăn còn lại đã được đậy kỹ.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_cover_to_leftovers_success_1f9b80c0.wav",
    text: "Đồ ăn còn lại đã được đậy kỹ.",
  },
  [normalizeText("Cho chén vào máy rửa chén.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_dish_to_dishwasher_2d2d7d0b.wav",
    text: "Cho chén vào máy rửa chén.",
  },
  [normalizeText("Kéo chén tới máy rửa chén nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_dish_to_dishwasher_fail_18018bd2.wav",
    text: "Kéo chén tới máy rửa chén nhé.",
  },
  [normalizeText("Chén đã được cho vào máy rửa chén.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_dish_to_dishwasher_success_eb6b05c8.wav",
    text: "Chén đã được cho vào máy rửa chén.",
  },
  [normalizeText("Đặt đồ ăn còn lại lên quầy bếp.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_leftovers_to_counter_cf705d91.wav",
    text: "Đặt đồ ăn còn lại lên quầy bếp.",
  },
  [normalizeText("Kéo đồ ăn còn lại tới quầy bếp nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_leftovers_to_counter_fail_acc03052.wav",
    text: "Kéo đồ ăn còn lại tới quầy bếp nhé.",
  },
  [normalizeText("Đồ ăn còn lại đã ở trên quầy bếp.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_leftovers_to_counter_success_8dec17ca.wav",
    text: "Đồ ăn còn lại đã ở trên quầy bếp.",
  },
  [normalizeText("Cất đồ ăn còn lại.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_save_leftovers_396301c3.wav",
    text: "Cất đồ ăn còn lại.",
  },
  [normalizeText("Đồ ăn còn lại đã được cất gọn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/drag_save_leftovers_success_4e1ded63.wav",
    text: "Đồ ăn còn lại đã được cất gọn.",
  },
  [normalizeText("Ăn tối xong rồi, mình dọn nhẹ nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/intro_b5b23a34.wav",
    text: "Ăn tối xong rồi, mình dọn nhẹ nhé.",
  },
  [normalizeText("Dọn một chút sau bữa tối giúp căn bếp gọn hơn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/intro_success_035354d4.wav",
    text: "Dọn một chút sau bữa tối giúp căn bếp gọn hơn.",
  },
  [normalizeText("Chạm vào món tráng miệng nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dessert_18402cf1.wav",
    text: "Chạm vào món tráng miệng nhé.",
  },
  [normalizeText("Món tráng miệng nằm bên trái phần đồ ăn còn lại đó.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dessert_fail_4410a010.wav",
    text: "Món tráng miệng nằm bên trái phần đồ ăn còn lại đó.",
  },
  [normalizeText("Đúng rồi, đó là món tráng miệng.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dessert_success_5404539d.wav",
    text: "Đúng rồi, đó là món tráng miệng.",
  },
  [normalizeText("Chạm vào đèn bàn ăn nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dining_light_d97d40a8.wav",
    text: "Chạm vào đèn bàn ăn nhé.",
  },
  [normalizeText("Đèn bàn ăn nằm phía trên đó.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dining_light_fail_5ccf9ad3.wav",
    text: "Đèn bàn ăn nằm phía trên đó.",
  },
  [normalizeText("Đúng rồi, đó là đèn bàn ăn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dining_light_success_9929f68f.wav",
    text: "Đúng rồi, đó là đèn bàn ăn.",
  },
  [normalizeText("Chạm vào máy rửa chén nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dishwasher_9e9d2b71.wav",
    text: "Chạm vào máy rửa chén nhé.",
  },
  [normalizeText("Máy rửa chén nằm bên phải đó.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dishwasher_fail_68a11839.wav",
    text: "Máy rửa chén nằm bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là máy rửa chén.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_dishwasher_success_6de50d8e.wav",
    text: "Đúng rồi, đó là máy rửa chén.",
  },
  [normalizeText("Chúc mọi người ngủ ngon.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_good_night_2fda57fb.wav",
    text: "Chúc mọi người ngủ ngon.",
  },
  [normalizeText("Chạm vào thẻ chúc ngủ ngon nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_good_night_fail_47fac536.wav",
    text: "Chạm vào thẻ chúc ngủ ngon nhé.",
  },
  [normalizeText("Bé đã chúc ngủ ngon thật đáng yêu.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_good_night_success_5ac56dfa.wav",
    text: "Bé đã chúc ngủ ngon thật đáng yêu.",
  },
  [normalizeText("Chạm vào đồ ăn còn lại nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_leftovers_bc6432ec.wav",
    text: "Chạm vào đồ ăn còn lại nhé.",
  },
  [normalizeText("Đồ ăn còn lại nằm ở giữa khu dọn đó.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_leftovers_fail_e72821de.wav",
    text: "Đồ ăn còn lại nằm ở giữa khu dọn đó.",
  },
  [normalizeText("Đúng rồi, đó là đồ ăn còn lại.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/tap_leftovers_success_ef46fead.wav",
    text: "Đúng rồi, đó là đồ ăn còn lại.",
  },
  [normalizeText("Đây là món tráng miệng.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_dessert_e9c72ab1.wav",
    text: "Đây là món tráng miệng.",
  },
  [normalizeText("Từ này nghĩa là món tráng miệng.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_dessert_success_3a4d8e33.wav",
    text: "Từ này nghĩa là món tráng miệng.",
  },
  [normalizeText("Đây là đèn bàn ăn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_dining_light_6b438ec4.wav",
    text: "Đây là đèn bàn ăn.",
  },
  [normalizeText("Từ này nghĩa là đèn bàn ăn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_dining_light_success_3ba2fd8a.wav",
    text: "Từ này nghĩa là đèn bàn ăn.",
  },
  [normalizeText("Đây là máy rửa chén.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_dishwasher_97c6b41d.wav",
    text: "Đây là máy rửa chén.",
  },
  [normalizeText("Từ này nghĩa là máy rửa chén.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_dishwasher_success_174b48dd.wav",
    text: "Từ này nghĩa là máy rửa chén.",
  },
  [normalizeText("Đây là nắp đậy thức ăn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_food_cover_d4370766.wav",
    text: "Đây là nắp đậy thức ăn.",
  },
  [normalizeText("Từ này nghĩa là nắp đậy thức ăn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_food_cover_success_b42dfdf4.wav",
    text: "Từ này nghĩa là nắp đậy thức ăn.",
  },
  [normalizeText("Đây là quầy bếp.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_kitchen_counter_ca7ff8ff.wav",
    text: "Đây là quầy bếp.",
  },
  [normalizeText("Từ này nghĩa là quầy bếp.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_kitchen_counter_success_51d3d8bb.wav",
    text: "Từ này nghĩa là quầy bếp.",
  },
  [normalizeText("Đây là đồ ăn còn lại.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_leftovers_72b497b6.wav",
    text: "Đây là đồ ăn còn lại.",
  },
  [normalizeText("Từ này nghĩa là đồ ăn còn lại.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_leftovers_success_7c18be69.wav",
    text: "Từ này nghĩa là đồ ăn còn lại.",
  },
  [normalizeText("Mình học câu cho chén vào máy nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_load_dishwasher_528be105.wav",
    text: "Mình học câu cho chén vào máy nhé.",
  },
  [normalizeText("Cho chén vào máy rửa chén giúp bếp gọn hơn.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_load_dishwasher_success_f0707345.wav",
    text: "Cho chén vào máy rửa chén giúp bếp gọn hơn.",
  },
  [normalizeText("Mình học câu cất đồ ăn còn lại nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_save_leftovers_c36045e4.wav",
    text: "Mình học câu cất đồ ăn còn lại nhé.",
  },
  [normalizeText("Cất đồ ăn còn lại giúp không lãng phí.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_save_leftovers_success_8aaa5b8e.wav",
    text: "Cất đồ ăn còn lại giúp không lãng phí.",
  },
  [normalizeText("Mình học câu chúc ngủ ngon nhé.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_say_good_night_14e437a2.wav",
    text: "Mình học câu chúc ngủ ngon nhé.",
  },
  [normalizeText("Chúc ngủ ngon sau bữa tối thật ấm áp.")]: {
    key: "lessons/family-dinner/dinner-cleanup/audio/vi/teach_say_good_night_success_3d09020a.wav",
    text: "Chúc ngủ ngon sau bữa tối thật ấm áp.",
  },
  [normalizeText("Bé đã chuẩn bị bữa tối thật chu đáo!")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/completion_f5aeb356.wav",
    text: "Bé đã chuẩn bị bữa tối thật chu đáo!",
  },
  [normalizeText("Bê khay phục vụ tới bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_carry_tray_8a01db82.wav",
    text: "Bê khay phục vụ tới bữa tối.",
  },
  [normalizeText("Kéo khay phục vụ tới khu bữa tối nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_carry_tray_fail_0f0532f2.wav",
    text: "Kéo khay phục vụ tới khu bữa tối nhé.",
  },
  [normalizeText("Khay phục vụ đã đến khu bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_carry_tray_success_1905f696.wav",
    text: "Khay phục vụ đã đến khu bữa tối.",
  },
  [normalizeText("Đặt vá múc lên khay phục vụ.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_ladle_to_tray_22391254.wav",
    text: "Đặt vá múc lên khay phục vụ.",
  },
  [normalizeText("Kéo vá múc tới khay phục vụ nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_ladle_to_tray_fail_8f628903.wav",
    text: "Kéo vá múc tới khay phục vụ nhé.",
  },
  [normalizeText("Vá múc đã nằm trên khay phục vụ.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_ladle_to_tray_success_bbda8ad3.wav",
    text: "Vá múc đã nằm trên khay phục vụ.",
  },
  [normalizeText("Đặt tấm lót ăn vào chỗ ngồi.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_placemat_to_spot_e60e5176.wav",
    text: "Đặt tấm lót ăn vào chỗ ngồi.",
  },
  [normalizeText("Kéo tấm lót ăn tới chỗ bữa tối nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_placemat_to_spot_fail_1f9a5a73.wav",
    text: "Kéo tấm lót ăn tới chỗ bữa tối nhé.",
  },
  [normalizeText("Tấm lót ăn đã nằm ngay ngắn.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_placemat_to_spot_success_5059011d.wav",
    text: "Tấm lót ăn đã nằm ngay ngắn.",
  },
  [normalizeText("Đặt tấm lót ăn ngay ngắn.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_set_placemat_d7acb72e.wav",
    text: "Đặt tấm lót ăn ngay ngắn.",
  },
  [normalizeText("Kéo tấm lót ăn vào chỗ ngồi nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_set_placemat_fail_578756c4.wav",
    text: "Kéo tấm lót ăn vào chỗ ngồi nhé.",
  },
  [normalizeText("Chỗ ngồi đã sẵn sàng.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/drag_set_placemat_success_c628535a.wav",
    text: "Chỗ ngồi đã sẵn sàng.",
  },
  [normalizeText("Đến giờ chuẩn bị bữa tối rồi.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/intro_2591b603.wav",
    text: "Đến giờ chuẩn bị bữa tối rồi.",
  },
  [normalizeText("Bé có thể giúp chuẩn bị bữa tối cùng cả nhà.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/intro_success_778c119a.wav",
    text: "Bé có thể giúp chuẩn bị bữa tối cùng cả nhà.",
  },
  [normalizeText("Chạm vào tạp dề nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_apron_a095fcb1.wav",
    text: "Chạm vào tạp dề nhé.",
  },
  [normalizeText("Tạp dề treo bên trái đó.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_apron_fail_6dfa0dc8.wav",
    text: "Tạp dề treo bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là tạp dề.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_apron_success_befae284.wav",
    text: "Đúng rồi, đó là tạp dề.",
  },
  [normalizeText("Gọi mọi người vào ăn tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_call_everyone_0891a8f3.wav",
    text: "Gọi mọi người vào ăn tối.",
  },
  [normalizeText("Chạm vào chuông để gọi mọi người nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_call_everyone_fail_baf9dd55.wav",
    text: "Chạm vào chuông để gọi mọi người nhé.",
  },
  [normalizeText("Mọi người đã sẵn sàng cho bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_call_everyone_success_862d4d07.wav",
    text: "Mọi người đã sẵn sàng cho bữa tối.",
  },
  [normalizeText("Chạm vào bữa tối nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_dinner_44eb639d.wav",
    text: "Chạm vào bữa tối nhé.",
  },
  [normalizeText("Chạm vào chuông gọi ăn tối nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_dinner_bell_cb370718.wav",
    text: "Chạm vào chuông gọi ăn tối nhé.",
  },
  [normalizeText("Chuông gọi ăn tối ở phía trên đó.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_dinner_bell_fail_36a08e3f.wav",
    text: "Chuông gọi ăn tối ở phía trên đó.",
  },
  [normalizeText("Đúng rồi, đó là chuông gọi ăn tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_dinner_bell_success_c053261c.wav",
    text: "Đúng rồi, đó là chuông gọi ăn tối.",
  },
  [normalizeText("Bữa tối nằm ở giữa khu ăn đó.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_dinner_fail_f94c5fc4.wav",
    text: "Bữa tối nằm ở giữa khu ăn đó.",
  },
  [normalizeText("Đúng rồi, đó là bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_dinner_success_58d5917c.wav",
    text: "Đúng rồi, đó là bữa tối.",
  },
  [normalizeText("Chạm vào khay phục vụ nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_serving_tray_2ada2549.wav",
    text: "Chạm vào khay phục vụ nhé.",
  },
  [normalizeText("Khay phục vụ nằm gần bữa tối đó.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_serving_tray_fail_113b6658.wav",
    text: "Khay phục vụ nằm gần bữa tối đó.",
  },
  [normalizeText("Đúng rồi, đó là khay phục vụ.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/tap_serving_tray_success_279f5559.wav",
    text: "Đúng rồi, đó là khay phục vụ.",
  },
  [normalizeText("Đây là tạp dề.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_apron_77e977b8.wav",
    text: "Đây là tạp dề.",
  },
  [normalizeText("Từ này nghĩa là tạp dề.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_apron_success_8b1badbf.wav",
    text: "Từ này nghĩa là tạp dề.",
  },
  [normalizeText("Mình học câu gọi mọi người nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_call_everyone_85e0acb7.wav",
    text: "Mình học câu gọi mọi người nhé.",
  },
  [normalizeText("Gọi mọi người để cùng bắt đầu bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_call_everyone_success_724ffdf0.wav",
    text: "Gọi mọi người để cùng bắt đầu bữa tối.",
  },
  [normalizeText("Mình học câu bê khay nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_carry_tray_2758da9f.wav",
    text: "Mình học câu bê khay nhé.",
  },
  [normalizeText("Bê khay cẩn thận để món ăn không bị rơi.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_carry_tray_success_6199a10a.wav",
    text: "Bê khay cẩn thận để món ăn không bị rơi.",
  },
  [normalizeText("Đây là chuông gọi ăn tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_dinner_bell_bd1b0e74.wav",
    text: "Đây là chuông gọi ăn tối.",
  },
  [normalizeText("Từ này nghĩa là chuông gọi ăn tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_dinner_bell_success_7bf86164.wav",
    text: "Từ này nghĩa là chuông gọi ăn tối.",
  },
  [normalizeText("Đây là bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_dinner_d6f7eb0d.wav",
    text: "Đây là bữa tối.",
  },
  [normalizeText("Từ này nghĩa là bữa tối.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_dinner_success_c7ebd74f.wav",
    text: "Từ này nghĩa là bữa tối.",
  },
  [normalizeText("Đây là vá múc.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_ladle_7cf63d7e.wav",
    text: "Đây là vá múc.",
  },
  [normalizeText("Từ này nghĩa là vá múc.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_ladle_success_ecbe8ed3.wav",
    text: "Từ này nghĩa là vá múc.",
  },
  [normalizeText("Đây là tấm lót ăn.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_placemat_c27d671c.wav",
    text: "Đây là tấm lót ăn.",
  },
  [normalizeText("Từ này nghĩa là tấm lót ăn.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_placemat_success_b81f288f.wav",
    text: "Từ này nghĩa là tấm lót ăn.",
  },
  [normalizeText("Đây là khay phục vụ.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_serving_tray_b62fc188.wav",
    text: "Đây là khay phục vụ.",
  },
  [normalizeText("Từ này nghĩa là khay phục vụ.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_serving_tray_success_1a22e37a.wav",
    text: "Từ này nghĩa là khay phục vụ.",
  },
  [normalizeText("Mình học câu đặt tấm lót ăn nhé.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_set_placemat_553cdf28.wav",
    text: "Mình học câu đặt tấm lót ăn nhé.",
  },
  [normalizeText("Đặt tấm lót ăn giúp chỗ ngồi gọn hơn.")]: {
    key: "lessons/family-dinner/dinner-prep/audio/vi/teach_set_placemat_success_62fef024.wav",
    text: "Đặt tấm lót ăn giúp chỗ ngồi gọn hơn.",
  },
  [normalizeText("Bé đã chia món trong bữa tối thật lịch sự!")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/completion_41b5538e.wav",
    text: "Bé đã chia món trong bữa tối thật lịch sự!",
  },
  [normalizeText("Chuyền món ăn cho người lớn.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_dish_to_grownup_a309cb77.wav",
    text: "Chuyền món ăn cho người lớn.",
  },
  [normalizeText("Kéo món ăn tới người lớn nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_dish_to_grownup_fail_8e757266.wav",
    text: "Kéo món ăn tới người lớn nhé.",
  },
  [normalizeText("Món ăn đã được chuyền qua bàn.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_dish_to_grownup_success_145424ae.wav",
    text: "Món ăn đã được chuyền qua bàn.",
  },
  [normalizeText("Đặt mì vào khu món ăn.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_noodles_to_meal_1c84ba64.wav",
    text: "Đặt mì vào khu món ăn.",
  },
  [normalizeText("Kéo mì tới khu món ăn nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_noodles_to_meal_fail_546b1ba6.wav",
    text: "Kéo mì tới khu món ăn nhé.",
  },
  [normalizeText("Mì đã được đặt vào bữa tối.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_noodles_to_meal_success_3efe29e1.wav",
    text: "Mì đã được đặt vào bữa tối.",
  },
  [normalizeText("Đặt rau trộn vào bữa tối.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_salad_to_meal_792123c8.wav",
    text: "Đặt rau trộn vào bữa tối.",
  },
  [normalizeText("Kéo rau trộn tới khu món ăn nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_salad_to_meal_fail_fe341b85.wav",
    text: "Kéo rau trộn tới khu món ăn nhé.",
  },
  [normalizeText("Rau trộn đã nằm cạnh các món khác.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_salad_to_meal_success_3088c44e.wav",
    text: "Rau trộn đã nằm cạnh các món khác.",
  },
  [normalizeText("Lấy mì cho bé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_serve_noodles_b44a8ac6.wav",
    text: "Lấy mì cho bé.",
  },
  [normalizeText("Kéo mì tới chỗ bé nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_serve_noodles_fail_23e31d5d.wav",
    text: "Kéo mì tới chỗ bé nhé.",
  },
  [normalizeText("Phần mì đã sẵn sàng.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_serve_noodles_success_5cd013f4.wav",
    text: "Phần mì đã sẵn sàng.",
  },
  [normalizeText("Cho bé thử một ít rau củ.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_vegetables_to_child_b79fab6a.wav",
    text: "Cho bé thử một ít rau củ.",
  },
  [normalizeText("Kéo rau củ tới chỗ bé nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_vegetables_to_child_fail_1b8584e2.wav",
    text: "Kéo rau củ tới chỗ bé nhé.",
  },
  [normalizeText("Bé đã thử rau củ rồi.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/drag_vegetables_to_child_success_ac58902d.wav",
    text: "Bé đã thử rau củ rồi.",
  },
  [normalizeText("Bữa tối đã lên bàn rồi.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/intro_4c0f0def.wav",
    text: "Bữa tối đã lên bàn rồi.",
  },
  [normalizeText("Bé cùng nhìn các món ăn trong bữa tối nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/intro_success_cbc9162c.wav",
    text: "Bé cùng nhìn các món ăn trong bữa tối nhé.",
  },
  [normalizeText("Chạm vào thịt gà nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_chicken_11563160.wav",
    text: "Chạm vào thịt gà nhé.",
  },
  [normalizeText("Thịt gà nằm gần món mì đó.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_chicken_fail_f92494b7.wav",
    text: "Thịt gà nằm gần món mì đó.",
  },
  [normalizeText("Đúng rồi, đó là thịt gà.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_chicken_success_19851129.wav",
    text: "Đúng rồi, đó là thịt gà.",
  },
  [normalizeText("Chạm vào món cá nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_fish_cb5a0def.wav",
    text: "Chạm vào món cá nhé.",
  },
  [normalizeText("Món cá nằm ở giữa bàn ăn đó.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_fish_fail_83baccb4.wav",
    text: "Món cá nằm ở giữa bàn ăn đó.",
  },
  [normalizeText("Đúng rồi, đó là cá.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_fish_success_4a4c2991.wav",
    text: "Đúng rồi, đó là cá.",
  },
  [normalizeText("Chạm vào nước sốt nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_sauce_cee68099.wav",
    text: "Chạm vào nước sốt nhé.",
  },
  [normalizeText("Nước sốt nằm ở góc bên phải đó.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_sauce_fail_682328b0.wav",
    text: "Nước sốt nằm ở góc bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là nước sốt.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_sauce_success_9e3ed1b1.wav",
    text: "Đúng rồi, đó là nước sốt.",
  },
  [normalizeText("Chạm vào rau củ nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_vegetables_dda9a8f5.wav",
    text: "Chạm vào rau củ nhé.",
  },
  [normalizeText("Rau củ nằm bên trái món cá đó.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_vegetables_fail_586315df.wav",
    text: "Rau củ nằm bên trái món cá đó.",
  },
  [normalizeText("Đúng rồi, đó là rau củ.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/tap_vegetables_success_954f0890.wav",
    text: "Đúng rồi, đó là rau củ.",
  },
  [normalizeText("Đây là thịt gà.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_chicken_3f45f37e.wav",
    text: "Đây là thịt gà.",
  },
  [normalizeText("Từ này nghĩa là thịt gà.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_chicken_success_9d583e4d.wav",
    text: "Từ này nghĩa là thịt gà.",
  },
  [normalizeText("Đây là cá.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_fish_10bf9d2c.wav",
    text: "Đây là cá.",
  },
  [normalizeText("Từ này nghĩa là cá.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_fish_success_211ee1ec.wav",
    text: "Từ này nghĩa là cá.",
  },
  [normalizeText("Đây là mì.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_noodles_b8cebea8.wav",
    text: "Đây là mì.",
  },
  [normalizeText("Từ này nghĩa là mì.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_noodles_success_6e6187cf.wav",
    text: "Từ này nghĩa là mì.",
  },
  [normalizeText("Mình học câu chuyền món nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_pass_dish_0391fe50.wav",
    text: "Mình học câu chuyền món nhé.",
  },
  [normalizeText("Chuyền món nhẹ nhàng để cả nhà cùng ăn.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_pass_dish_success_884c2390.wav",
    text: "Chuyền món nhẹ nhàng để cả nhà cùng ăn.",
  },
  [normalizeText("Đây là rau trộn.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_salad_bfa53034.wav",
    text: "Đây là rau trộn.",
  },
  [normalizeText("Từ này nghĩa là rau trộn.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_salad_success_ba884dc8.wav",
    text: "Từ này nghĩa là rau trộn.",
  },
  [normalizeText("Đây là nước sốt.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_sauce_bbe0cda2.wav",
    text: "Đây là nước sốt.",
  },
  [normalizeText("Từ này nghĩa là nước sốt.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_sauce_success_736573f5.wav",
    text: "Từ này nghĩa là nước sốt.",
  },
  [normalizeText("Mình học câu lấy mì nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_serve_noodles_62df33b3.wav",
    text: "Mình học câu lấy mì nhé.",
  },
  [normalizeText("Lấy mì vừa đủ giúp bữa tối gọn gàng.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_serve_noodles_success_756aca21.wav",
    text: "Lấy mì vừa đủ giúp bữa tối gọn gàng.",
  },
  [normalizeText("Mình học câu thử rau củ nhé.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_try_vegetables_c3b475c6.wav",
    text: "Mình học câu thử rau củ nhé.",
  },
  [normalizeText("Thử rau củ giúp bé quen nhiều món mới.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_try_vegetables_success_e8828add.wav",
    text: "Thử rau củ giúp bé quen nhiều món mới.",
  },
  [normalizeText("Đây là rau củ.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_vegetables_3a379753.wav",
    text: "Đây là rau củ.",
  },
  [normalizeText("Từ này nghĩa là rau củ.")]: {
    key: "lessons/family-dinner/dinner-table/audio/vi/teach_vegetables_success_02a1b015.wav",
    text: "Từ này nghĩa là rau củ.",
  },
  [normalizeText("Bé đã chơi sáng tạo thật khéo!")]: {
    key: "lessons/home-play/creative-play/audio/vi/completion_c2b144ec.wav",
    text: "Bé đã chơi sáng tạo thật khéo!",
  },
  [normalizeText("Vẽ một bức tranh trên giấy.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_crayon_draw_f096ffad.wav",
    text: "Vẽ một bức tranh trên giấy.",
  },
  [normalizeText("Bức tranh của bé thật đẹp.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_crayon_draw_success_2fb486ab.wav",
    text: "Bức tranh của bé thật đẹp.",
  },
  [normalizeText("Đưa bút màu tới tờ giấy.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_crayon_to_paper_5e814894.wav",
    text: "Đưa bút màu tới tờ giấy.",
  },
  [normalizeText("Kéo bút màu tới tờ giấy nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_crayon_to_paper_fail_51d73173.wav",
    text: "Kéo bút màu tới tờ giấy nhé.",
  },
  [normalizeText("Bé đã sẵn sàng vẽ trên giấy.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_crayon_to_paper_success_52776023.wav",
    text: "Bé đã sẵn sàng vẽ trên giấy.",
  },
  [normalizeText("Đặt mảnh ghép vào đúng vị trí.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_puzzle_piece_4f6dcda9.wav",
    text: "Đặt mảnh ghép vào đúng vị trí.",
  },
  [normalizeText("Kéo mảnh ghép vào tranh ghép nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_puzzle_piece_fail_03766802.wav",
    text: "Kéo mảnh ghép vào tranh ghép nhé.",
  },
  [normalizeText("Bức tranh ghép đã hoàn thành.")]: {
    key: "lessons/home-play/creative-play/audio/vi/drag_puzzle_piece_success_aef2055c.wav",
    text: "Bức tranh ghép đã hoàn thành.",
  },
  [normalizeText("Mình cùng chơi sáng tạo nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/intro_6bc468d8.wav",
    text: "Mình cùng chơi sáng tạo nhé.",
  },
  [normalizeText("Bé có thể đọc, vẽ và ghép hình.")]: {
    key: "lessons/home-play/creative-play/audio/vi/intro_success_752a5801.wav",
    text: "Bé có thể đọc, vẽ và ghép hình.",
  },
  [normalizeText("Quyển sách nằm trên bàn chơi đó.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_book_fail_faf6b697.wav",
    text: "Quyển sách nằm trên bàn chơi đó.",
  },
  [normalizeText("Chạm vào quyển sách để đọc sách.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_book_read_13ae5ec8.wav",
    text: "Chạm vào quyển sách để đọc sách.",
  },
  [normalizeText("Chạm vào quyển sách để đọc nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_book_read_fail_c2610b6e.wav",
    text: "Chạm vào quyển sách để đọc nhé.",
  },
  [normalizeText("Bé đang đọc sách rất chăm chú.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_book_read_success_206753a9.wav",
    text: "Bé đang đọc sách rất chăm chú.",
  },
  [normalizeText("Bút màu nằm cạnh tờ giấy đó.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_crayon_fail_2c8d2884.wav",
    text: "Bút màu nằm cạnh tờ giấy đó.",
  },
  [normalizeText("Đúng rồi, đó là bút màu.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_crayon_success_0a282c00.wav",
    text: "Đúng rồi, đó là bút màu.",
  },
  [normalizeText("Chạm vào cái trống nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_drum_5dca07a7.wav",
    text: "Chạm vào cái trống nhé.",
  },
  [normalizeText("Cái trống ở dưới bàn chơi đó.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_drum_fail_9bb92b54.wav",
    text: "Cái trống ở dưới bàn chơi đó.",
  },
  [normalizeText("Đúng rồi, đó là cái trống.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_drum_success_c5e4589c.wav",
    text: "Đúng rồi, đó là cái trống.",
  },
  [normalizeText("Chạm vào nốt nhạc nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_music_90cbd99d.wav",
    text: "Chạm vào nốt nhạc nhé.",
  },
  [normalizeText("Nốt nhạc đang bay phía trên đó.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_music_fail_97a4e1d5.wav",
    text: "Nốt nhạc đang bay phía trên đó.",
  },
  [normalizeText("Âm nhạc nghe thật vui.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_music_success_25324dc6.wav",
    text: "Âm nhạc nghe thật vui.",
  },
  [normalizeText("Chạm vào tranh ghép nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_puzzle_616963ac.wav",
    text: "Chạm vào tranh ghép nhé.",
  },
  [normalizeText("Tranh ghép ở cạnh tờ giấy đó.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_puzzle_fail_352d1cc0.wav",
    text: "Tranh ghép ở cạnh tờ giấy đó.",
  },
  [normalizeText("Đúng rồi, đó là tranh ghép.")]: {
    key: "lessons/home-play/creative-play/audio/vi/tap_puzzle_success_7afd9a20.wav",
    text: "Đúng rồi, đó là tranh ghép.",
  },
  [normalizeText("Mình học câu vẽ tranh nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_draw_picture_0e795123.wav",
    text: "Mình học câu vẽ tranh nhé.",
  },
  [normalizeText("Bé dùng bút màu để vẽ trên giấy.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_draw_picture_success_f176a651.wav",
    text: "Bé dùng bút màu để vẽ trên giấy.",
  },
  [normalizeText("Đây là cái trống.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_drum_6648ae85.wav",
    text: "Đây là cái trống.",
  },
  [normalizeText("Từ này nghĩa là cái trống.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_drum_success_ed97987b.wav",
    text: "Từ này nghĩa là cái trống.",
  },
  [normalizeText("Đây là âm nhạc.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_music_913cd5fc.wav",
    text: "Đây là âm nhạc.",
  },
  [normalizeText("Từ này nghĩa là âm nhạc.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_music_success_caf3e097.wav",
    text: "Từ này nghĩa là âm nhạc.",
  },
  [normalizeText("Đây là tờ giấy.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_paper_bf9ff2de.wav",
    text: "Đây là tờ giấy.",
  },
  [normalizeText("Từ này nghĩa là tờ giấy.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_paper_success_09edb5ca.wav",
    text: "Từ này nghĩa là tờ giấy.",
  },
  [normalizeText("Đây là tranh ghép.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_puzzle_ffd34872.wav",
    text: "Đây là tranh ghép.",
  },
  [normalizeText("Từ này nghĩa là tranh ghép.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_puzzle_success_9d26f486.wav",
    text: "Từ này nghĩa là tranh ghép.",
  },
  [normalizeText("Mình học câu đọc sách nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_read_book_de6c28fb.wav",
    text: "Mình học câu đọc sách nhé.",
  },
  [normalizeText("Đọc sách giúp bé tưởng tượng nhiều hơn.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_read_book_success_819bc0fe.wav",
    text: "Đọc sách giúp bé tưởng tượng nhiều hơn.",
  },
  [normalizeText("Mình học câu ghép tranh nhé.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_solve_puzzle_db8adae5.wav",
    text: "Mình học câu ghép tranh nhé.",
  },
  [normalizeText("Ghép đúng mảnh sẽ hoàn thành bức tranh.")]: {
    key: "lessons/home-play/creative-play/audio/vi/teach_solve_puzzle_success_17f03e33.wav",
    text: "Ghép đúng mảnh sẽ hoàn thành bức tranh.",
  },
  [normalizeText("Bé đã chơi ở góc đồ chơi thật vui!")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/completion_d1dfc248.wav",
    text: "Bé đã chơi ở góc đồ chơi thật vui!",
  },
  [normalizeText("Đặt khối xếp hình vào hộp.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_blocks_to_box_cff93205.wav",
    text: "Đặt khối xếp hình vào hộp.",
  },
  [normalizeText("Kéo khối xếp hình tới cái hộp nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_blocks_to_box_fail_44585b45.wav",
    text: "Kéo khối xếp hình tới cái hộp nhé.",
  },
  [normalizeText("Khối xếp hình đã nằm trong hộp.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_blocks_to_box_success_26e91bb9.wav",
    text: "Khối xếp hình đã nằm trong hộp.",
  },
  [normalizeText("Xếp khối hình thành một cái tháp.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_blocks_to_tower_973b1cff.wav",
    text: "Xếp khối hình thành một cái tháp.",
  },
  [normalizeText("Kéo khối xếp hình tới vùng xây tháp nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_blocks_to_tower_fail_d9cf3e65.wav",
    text: "Kéo khối xếp hình tới vùng xây tháp nhé.",
  },
  [normalizeText("Cái tháp đã được xây xong.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_blocks_to_tower_success_644b2848.wav",
    text: "Cái tháp đã được xây xong.",
  },
  [normalizeText("Đưa xe đồ chơi chạy trên thảm.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_car_to_floor_b2ce4c27.wav",
    text: "Đưa xe đồ chơi chạy trên thảm.",
  },
  [normalizeText("Kéo xe đồ chơi tới đường chạy trên thảm nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_car_to_floor_fail_ddf228ea.wav",
    text: "Kéo xe đồ chơi tới đường chạy trên thảm nhé.",
  },
  [normalizeText("Xe đồ chơi chạy thật vui.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/drag_car_to_floor_success_501444c1.wav",
    text: "Xe đồ chơi chạy thật vui.",
  },
  [normalizeText("Mình cùng chơi ở góc đồ chơi nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/intro_135ab050.wav",
    text: "Mình cùng chơi ở góc đồ chơi nhé.",
  },
  [normalizeText("Bé nhớ chơi vui và giữ đồ chơi gọn gàng.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/intro_success_949ceab9.wav",
    text: "Bé nhớ chơi vui và giữ đồ chơi gọn gàng.",
  },
  [normalizeText("Chạm vào khối xếp hình nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_blocks_d73dd736.wav",
    text: "Chạm vào khối xếp hình nhé.",
  },
  [normalizeText("Khối xếp hình ở cạnh đồ chơi đó.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_blocks_fail_20224d76.wav",
    text: "Khối xếp hình ở cạnh đồ chơi đó.",
  },
  [normalizeText("Đúng rồi, đó là khối xếp hình.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_blocks_success_c2e73e95.wav",
    text: "Đúng rồi, đó là khối xếp hình.",
  },
  [normalizeText("Chọn một món đồ chơi cho bé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_choice_ac860734.wav",
    text: "Chọn một món đồ chơi cho bé.",
  },
  [normalizeText("Chọn một món đồ chơi trên thảm nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_choice_fail_974f2b5b.wav",
    text: "Chọn một món đồ chơi trên thảm nhé.",
  },
  [normalizeText("Bé đã chọn được món đồ chơi rồi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_choice_success_a524b45f.wav",
    text: "Bé đã chọn được món đồ chơi rồi.",
  },
  [normalizeText("Búp bê nằm gần bé đó.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_doll_fail_415e24c8.wav",
    text: "Búp bê nằm gần bé đó.",
  },
  [normalizeText("Chạm nhẹ vào búp bê để chơi nhẹ nhàng.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_doll_gently_9769c193.wav",
    text: "Chạm nhẹ vào búp bê để chơi nhẹ nhàng.",
  },
  [normalizeText("Chạm nhẹ vào búp bê nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_doll_gently_fail_a3927aed.wav",
    text: "Chạm nhẹ vào búp bê nhé.",
  },
  [normalizeText("Bé chơi rất nhẹ nhàng.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_doll_gently_success_f75c6113.wav",
    text: "Bé chơi rất nhẹ nhàng.",
  },
  [normalizeText("Chạm vào kệ đồ chơi nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_shelf_d4803965.wav",
    text: "Chạm vào kệ đồ chơi nhé.",
  },
  [normalizeText("Kệ đồ chơi ở phía sau góc chơi đó.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_shelf_fail_561ded53.wav",
    text: "Kệ đồ chơi ở phía sau góc chơi đó.",
  },
  [normalizeText("Đúng rồi, đó là kệ đồ chơi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_shelf_success_b46c0c7d.wav",
    text: "Đúng rồi, đó là kệ đồ chơi.",
  },
  [normalizeText("Đồ chơi nằm trên thảm đó.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/tap_toy_fail_8b04d76c.wav",
    text: "Đồ chơi nằm trên thảm đó.",
  },
  [normalizeText("Mình học câu xây tháp nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_build_tower_65fdac58.wav",
    text: "Mình học câu xây tháp nhé.",
  },
  [normalizeText("Xếp các khối lên nhau sẽ thành một cái tháp.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_build_tower_success_1eac9ed3.wav",
    text: "Xếp các khối lên nhau sẽ thành một cái tháp.",
  },
  [normalizeText("Đây là xe đồ chơi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_car_13239778.wav",
    text: "Đây là xe đồ chơi.",
  },
  [normalizeText("Từ này nghĩa là xe đồ chơi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_car_success_ccacf253.wav",
    text: "Từ này nghĩa là xe đồ chơi.",
  },
  [normalizeText("Mình học câu chọn đồ chơi nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_choose_toy_0d99881e.wav",
    text: "Mình học câu chọn đồ chơi nhé.",
  },
  [normalizeText("Bé có thể chọn một món để chơi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_choose_toy_success_6c627abe.wav",
    text: "Bé có thể chọn một món để chơi.",
  },
  [normalizeText("Mình học câu chơi nhẹ nhàng nhé.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_play_gently_8bf1c4df.wav",
    text: "Mình học câu chơi nhẹ nhàng nhé.",
  },
  [normalizeText("Chơi nhẹ nhàng giúp đồ chơi bền hơn.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_play_gently_success_020b4abb.wav",
    text: "Chơi nhẹ nhàng giúp đồ chơi bền hơn.",
  },
  [normalizeText("Đây là kệ đồ chơi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_shelf_fe7827c9.wav",
    text: "Đây là kệ đồ chơi.",
  },
  [normalizeText("Từ này nghĩa là kệ đồ chơi.")]: {
    key: "lessons/home-play/home-toy-corner/audio/vi/teach_shelf_success_917fb5c3.wav",
    text: "Từ này nghĩa là kệ đồ chơi.",
  },
  [normalizeText("Bé đã dọn đồ chơi thật gọn gàng!")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/completion_e904d52c.wav",
    text: "Bé đã dọn đồ chơi thật gọn gàng!",
  },
  [normalizeText("Đặt cái giỏ lên kệ để dọn phòng.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_basket_to_shelf_8e490fd3.wav",
    text: "Đặt cái giỏ lên kệ để dọn phòng.",
  },
  [normalizeText("Kéo cái giỏ tới cái kệ nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_basket_to_shelf_fail_27ec4df2.wav",
    text: "Kéo cái giỏ tới cái kệ nhé.",
  },
  [normalizeText("Góc chơi đã gọn gàng rồi.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_basket_to_shelf_success_2089369e.wav",
    text: "Góc chơi đã gọn gàng rồi.",
  },
  [normalizeText("Cất khối xếp hình vào giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_blocks_to_basket_453ccd92.wav",
    text: "Cất khối xếp hình vào giỏ.",
  },
  [normalizeText("Kéo khối xếp hình tới cái giỏ nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_blocks_to_basket_fail_8fa53784.wav",
    text: "Kéo khối xếp hình tới cái giỏ nhé.",
  },
  [normalizeText("Khối xếp hình đã vào giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_blocks_to_basket_success_0b004405.wav",
    text: "Khối xếp hình đã vào giỏ.",
  },
  [normalizeText("Cất quyển sách lên kệ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_book_away_bb700afd.wav",
    text: "Cất quyển sách lên kệ.",
  },
  [normalizeText("Quyển sách đã được cất đúng chỗ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_book_away_success_1ba2a409.wav",
    text: "Quyển sách đã được cất đúng chỗ.",
  },
  [normalizeText("Đặt quyển sách lên kệ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_book_to_shelf_87f31454.wav",
    text: "Đặt quyển sách lên kệ.",
  },
  [normalizeText("Kéo quyển sách tới cái kệ nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_book_to_shelf_fail_abd8766f.wav",
    text: "Kéo quyển sách tới cái kệ nhé.",
  },
  [normalizeText("Quyển sách đã nằm trên kệ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_book_to_shelf_success_32aadfec.wav",
    text: "Quyển sách đã nằm trên kệ.",
  },
  [normalizeText("Kéo xe đồ chơi tới cái giỏ nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_car_to_basket_fail_7f0797bb.wav",
    text: "Kéo xe đồ chơi tới cái giỏ nhé.",
  },
  [normalizeText("Cất xe đồ chơi vào giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_car_to_basket_fe4892fb.wav",
    text: "Cất xe đồ chơi vào giỏ.",
  },
  [normalizeText("Xe đồ chơi đã vào giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_car_to_basket_success_10927fbd.wav",
    text: "Xe đồ chơi đã vào giỏ.",
  },
  [normalizeText("Dọn đồ chơi vào giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_toy_clean_up_a94c1a4c.wav",
    text: "Dọn đồ chơi vào giỏ.",
  },
  [normalizeText("Đồ chơi đã được dọn gọn.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_toy_clean_up_success_901bea77.wav",
    text: "Đồ chơi đã được dọn gọn.",
  },
  [normalizeText("Đặt đồ chơi vào giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_toy_to_basket_839c4f6b.wav",
    text: "Đặt đồ chơi vào giỏ.",
  },
  [normalizeText("Kéo đồ chơi tới cái giỏ nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_toy_to_basket_fail_ccd2e719.wav",
    text: "Kéo đồ chơi tới cái giỏ nhé.",
  },
  [normalizeText("Đồ chơi đã nằm trong giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/drag_toy_to_basket_success_33705db0.wav",
    text: "Đồ chơi đã nằm trong giỏ.",
  },
  [normalizeText("Chơi xong rồi, mình dọn đồ chơi nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/intro_6ea8994a.wav",
    text: "Chơi xong rồi, mình dọn đồ chơi nhé.",
  },
  [normalizeText("Bé biết dọn đồ sau khi chơi là rất giỏi.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/intro_success_d42fb2d8.wav",
    text: "Bé biết dọn đồ sau khi chơi là rất giỏi.",
  },
  [normalizeText("Chạm vào cái giỏ nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/tap_basket_dc1b9e9e.wav",
    text: "Chạm vào cái giỏ nhé.",
  },
  [normalizeText("Cái giỏ nằm cạnh kệ đó.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/tap_basket_fail_f7c11b11.wav",
    text: "Cái giỏ nằm cạnh kệ đó.",
  },
  [normalizeText("Đúng rồi, đó là cái giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/tap_basket_success_a5cc58d6.wav",
    text: "Đúng rồi, đó là cái giỏ.",
  },
  [normalizeText("Chạm vào sàn nhà nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/tap_floor_59bd2f1c.wav",
    text: "Chạm vào sàn nhà nhé.",
  },
  [normalizeText("Sàn nhà ở dưới chân bé đó.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/tap_floor_fail_f46c8f17.wav",
    text: "Sàn nhà ở dưới chân bé đó.",
  },
  [normalizeText("Đúng rồi, đó là sàn nhà.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/tap_floor_success_6b3e4f2b.wav",
    text: "Đúng rồi, đó là sàn nhà.",
  },
  [normalizeText("Đây là cái giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_basket_68904e6b.wav",
    text: "Đây là cái giỏ.",
  },
  [normalizeText("Từ này nghĩa là cái giỏ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_basket_success_6f735422.wav",
    text: "Từ này nghĩa là cái giỏ.",
  },
  [normalizeText("Mình học câu dọn đồ chơi nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_clean_up_toys_77447929.wav",
    text: "Mình học câu dọn đồ chơi nhé.",
  },
  [normalizeText("Dọn đồ chơi giúp góc chơi gọn hơn.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_clean_up_toys_success_692082ae.wav",
    text: "Dọn đồ chơi giúp góc chơi gọn hơn.",
  },
  [normalizeText("Đây là sàn nhà.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_floor_5b7daeed.wav",
    text: "Đây là sàn nhà.",
  },
  [normalizeText("Từ này nghĩa là sàn nhà.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_floor_success_b1b8456a.wav",
    text: "Từ này nghĩa là sàn nhà.",
  },
  [normalizeText("Mình học câu cất sách nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_put_away_book_b5f277a8.wav",
    text: "Mình học câu cất sách nhé.",
  },
  [normalizeText("Sách nên được đặt lại lên kệ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_put_away_book_success_e60c9e69.wav",
    text: "Sách nên được đặt lại lên kệ.",
  },
  [normalizeText("Đây là cái kệ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_shelf_41325e83.wav",
    text: "Đây là cái kệ.",
  },
  [normalizeText("Từ này nghĩa là cái kệ.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_shelf_success_8379290f.wav",
    text: "Từ này nghĩa là cái kệ.",
  },
  [normalizeText("Mình học câu dọn phòng nhé.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_tidy_room_15ba039c.wav",
    text: "Mình học câu dọn phòng nhé.",
  },
  [normalizeText("Dọn phòng giúp bé có chỗ chơi sạch đẹp.")]: {
    key: "lessons/home-play/toy-cleanup/audio/vi/teach_tidy_room_success_75e54ee7.wav",
    text: "Dọn phòng giúp bé có chỗ chơi sạch đẹp.",
  },
  [normalizeText("Bỏ vụn thức ăn vào thùng rác.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_crumbs_to_trash_74c048d9.wav",
    text: "Bỏ vụn thức ăn vào thùng rác.",
  },
  [normalizeText("Đưa vụn thức ăn vào thùng rác nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_crumbs_to_trash_fail_07a40ee4.wav",
    text: "Đưa vụn thức ăn vào thùng rác nhé.",
  },
  [normalizeText("Vụn thức ăn đã vào thùng rác.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_crumbs_to_trash_success_5c54546c.wav",
    text: "Vụn thức ăn đã vào thùng rác.",
  },
  [normalizeText("Đưa cái đĩa tới bồn rửa.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_plate_to_sink_475e2fb2.wav",
    text: "Đưa cái đĩa tới bồn rửa.",
  },
  [normalizeText("Đưa cái đĩa tới bồn rửa nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_plate_to_sink_fail_fa033a58.wav",
    text: "Đưa cái đĩa tới bồn rửa nhé.",
  },
  [normalizeText("Cái đĩa đã tới bồn rửa.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_plate_to_sink_success_f9cf3114.wav",
    text: "Cái đĩa đã tới bồn rửa.",
  },
  [normalizeText("Đưa xà phòng tới tay để rửa tay.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_soap_to_hands_03438145.wav",
    text: "Đưa xà phòng tới tay để rửa tay.",
  },
  [normalizeText("Tay bé sạch rồi!")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_soap_to_hands_success_7f310065.wav",
    text: "Tay bé sạch rồi!",
  },
  [normalizeText("Kéo khăn lau tới mặt bàn.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_towel_to_table_63c5eb55.wav",
    text: "Kéo khăn lau tới mặt bàn.",
  },
  [normalizeText("Kéo khăn lau tới mặt bàn nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_towel_to_table_fail_ecce0adc.wav",
    text: "Kéo khăn lau tới mặt bàn nhé.",
  },
  [normalizeText("Mặt bàn sạch rồi!")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_drag_towel_to_table_success_d2dd8159.wav",
    text: "Mặt bàn sạch rồi!",
  },
  [normalizeText("Ăn xong mình dọn gọn nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_intro_89b2f785.wav",
    text: "Ăn xong mình dọn gọn nhé.",
  },
  [normalizeText("Dọn dẹp sau bữa trưa nào!")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_intro_success_148e4e4f.wav",
    text: "Dọn dẹp sau bữa trưa nào!",
  },
  [normalizeText("Chạm vào cái đĩa nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_plate_00b467e0.wav",
    text: "Chạm vào cái đĩa nhé.",
  },
  [normalizeText("Cái đĩa ở trên bàn đó.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_plate_fail_ef6c204c.wav",
    text: "Cái đĩa ở trên bàn đó.",
  },
  [normalizeText("Đúng rồi, đó là cái đĩa.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_plate_success_1c6699cb.wav",
    text: "Đúng rồi, đó là cái đĩa.",
  },
  [normalizeText("Bồn rửa nằm phía trên bên phải đó.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_sink_fail_e229158b.wav",
    text: "Bồn rửa nằm phía trên bên phải đó.",
  },
  [normalizeText("Con tìm thấy bồn rửa rồi!")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_sink_success_8ecf25fc.wav",
    text: "Con tìm thấy bồn rửa rồi!",
  },
  [normalizeText("Xà phòng ở gần bồn rửa đó.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_soap_fail_41db83dc.wav",
    text: "Xà phòng ở gần bồn rửa đó.",
  },
  [normalizeText("Chạm vào xà phòng nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_soap_fe765f22.wav",
    text: "Chạm vào xà phòng nhé.",
  },
  [normalizeText("Con tìm thấy xà phòng rồi!")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_soap_success_8f533821.wav",
    text: "Con tìm thấy xà phòng rồi!",
  },
  [normalizeText("Chạm vào khăn lau nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_towel_ac5a6660.wav",
    text: "Chạm vào khăn lau nhé.",
  },
  [normalizeText("Khăn lau nằm phía dưới bên trái đó.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_towel_fail_dbf214d1.wav",
    text: "Khăn lau nằm phía dưới bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là khăn lau.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_tap_towel_success_947e72ba.wav",
    text: "Đúng rồi, đó là khăn lau.",
  },
  [normalizeText("Mình học câu dọn dẹp nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_clean_up_1f7086d9.wav",
    text: "Mình học câu dọn dẹp nhé.",
  },
  [normalizeText("Câu này nghĩa là dọn dẹp.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_clean_up_success_1a1ca3a3.wav",
    text: "Câu này nghĩa là dọn dẹp.",
  },
  [normalizeText("Đây là vụn thức ăn.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_crumbs_d01e3af7.wav",
    text: "Đây là vụn thức ăn.",
  },
  [normalizeText("Từ này nghĩa là vụn thức ăn.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_crumbs_success_b56320d0.wav",
    text: "Từ này nghĩa là vụn thức ăn.",
  },
  [normalizeText("Đây là bồn rửa.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_sink_41dc268b.wav",
    text: "Đây là bồn rửa.",
  },
  [normalizeText("Đây là thùng rác.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_trash_bin_f093cc8c.wav",
    text: "Đây là thùng rác.",
  },
  [normalizeText("Từ này nghĩa là thùng rác.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_trash_bin_success_d316febf.wav",
    text: "Từ này nghĩa là thùng rác.",
  },
  [normalizeText("Mình học câu rửa tay nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_wash_hands_b39802f2.wav",
    text: "Mình học câu rửa tay nhé.",
  },
  [normalizeText("Câu này nghĩa là rửa tay.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_wash_hands_success_fbb55504.wav",
    text: "Câu này nghĩa là rửa tay.",
  },
  [normalizeText("Mình học câu lau bàn nhé.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_wipe_table_34910a12.wav",
    text: "Mình học câu lau bàn nhé.",
  },
  [normalizeText("Câu này nghĩa là lau bàn.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/cleanup_teach_wipe_table_success_2d37984f.wav",
    text: "Câu này nghĩa là lau bàn.",
  },
  [normalizeText("Bé đã dọn gọn sau bữa trưa.")]: {
    key: "lessons/lunch-time/after-lunch/audio/vi/completion_165a53fe.wav",
    text: "Bé đã dọn gọn sau bữa trưa.",
  },
  [normalizeText("Bé đã chuẩn bị hộp cơm trưa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/completion_f055c155.wav",
    text: "Bé đã chuẩn bị hộp cơm trưa.",
  },
  [normalizeText("Đưa cơm tới miệng để ăn trưa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_rice_to_mouth_e7ba8df4.wav",
    text: "Đưa cơm tới miệng để ăn trưa.",
  },
  [normalizeText("Đưa cơm tới miệng bé nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_rice_to_mouth_fail_e49fcf17.wav",
    text: "Đưa cơm tới miệng bé nhé.",
  },
  [normalizeText("Bé ăn trưa ngon miệng!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_rice_to_mouth_success_a2785ded.wav",
    text: "Bé ăn trưa ngon miệng!",
  },
  [normalizeText("Đưa canh vào cái bát.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_soup_to_bowl_e64b96da.wav",
    text: "Đưa canh vào cái bát.",
  },
  [normalizeText("Đưa canh vào cái bát nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_soup_to_bowl_fail_08ba12a2.wav",
    text: "Đưa canh vào cái bát nhé.",
  },
  [normalizeText("Canh đã ở trong bát rồi!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_soup_to_bowl_success_025c6802.wav",
    text: "Canh đã ở trong bát rồi!",
  },
  [normalizeText("Dùng thìa để ăn canh.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_spoon_to_mouth_2f58c39a.wav",
    text: "Dùng thìa để ăn canh.",
  },
  [normalizeText("Đưa cái thìa tới miệng bé nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_spoon_to_mouth_fail_e5b02dd9.wav",
    text: "Đưa cái thìa tới miệng bé nhé.",
  },
  [normalizeText("Bé dùng thìa rất khéo!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_spoon_to_mouth_success_7b17a844.wav",
    text: "Bé dùng thìa rất khéo!",
  },
  [normalizeText("Đưa cái thìa tới bát canh.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_spoon_to_soup_00bb71c1.wav",
    text: "Đưa cái thìa tới bát canh.",
  },
  [normalizeText("Đưa cái thìa tới bát canh nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_spoon_to_soup_fail_722f2a9e.wav",
    text: "Đưa cái thìa tới bát canh nhé.",
  },
  [normalizeText("Cái thìa đã ở cạnh bát canh.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_drag_spoon_to_soup_success_0e32260b.wav",
    text: "Cái thìa đã ở cạnh bát canh.",
  },
  [normalizeText("Mình chuẩn bị ăn trưa nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_intro_b84da744.wav",
    text: "Mình chuẩn bị ăn trưa nhé.",
  },
  [normalizeText("Bữa trưa bắt đầu rồi!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_intro_success_d0a43ac1.wav",
    text: "Bữa trưa bắt đầu rồi!",
  },
  [normalizeText("Chạm vào cái nĩa nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_fork_3b210d9c.wav",
    text: "Chạm vào cái nĩa nhé.",
  },
  [normalizeText("Cái nĩa nằm gần cái thìa đó.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_fork_fail_4c086771.wav",
    text: "Cái nĩa nằm gần cái thìa đó.",
  },
  [normalizeText("Con tìm thấy cái nĩa rồi!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_fork_success_0ec413c8.wav",
    text: "Con tìm thấy cái nĩa rồi!",
  },
  [normalizeText("Chạm vào hộp cơm nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_lunchbox_73530166.wav",
    text: "Chạm vào hộp cơm nhé.",
  },
  [normalizeText("Hộp cơm nằm ở giữa khay đó.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_lunchbox_fail_af2b5a0a.wav",
    text: "Hộp cơm nằm ở giữa khay đó.",
  },
  [normalizeText("Đúng rồi, đó là hộp cơm.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_lunchbox_success_d5590934.wav",
    text: "Đúng rồi, đó là hộp cơm.",
  },
  [normalizeText("Chạm hộp cơm để mở nắp.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_open_lunchbox_b5a155dc.wav",
    text: "Chạm hộp cơm để mở nắp.",
  },
  [normalizeText("Chạm hộp cơm để mở nắp nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_open_lunchbox_fail_a85fc601.wav",
    text: "Chạm hộp cơm để mở nắp nhé.",
  },
  [normalizeText("Hộp cơm đã mở rồi!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_open_lunchbox_success_c81b4195.wav",
    text: "Hộp cơm đã mở rồi!",
  },
  [normalizeText("Chạm vào cơm nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_rice_ee1e7494.wav",
    text: "Chạm vào cơm nhé.",
  },
  [normalizeText("Cơm ở trên khay bên trái đó.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_rice_fail_3cc1da39.wav",
    text: "Cơm ở trên khay bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là cơm.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_rice_success_662a1977.wav",
    text: "Đúng rồi, đó là cơm.",
  },
  [normalizeText("Chạm vào canh nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_soup_c0c873c2.wav",
    text: "Chạm vào canh nhé.",
  },
  [normalizeText("Canh ở trong bát nhỏ bên phải đó.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_soup_fail_619abe40.wav",
    text: "Canh ở trong bát nhỏ bên phải đó.",
  },
  [normalizeText("Con tìm thấy canh rồi!")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_tap_soup_success_52fc0298.wav",
    text: "Con tìm thấy canh rồi!",
  },
  [normalizeText("Đây là cái bát.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_bowl_6be05de4.wav",
    text: "Đây là cái bát.",
  },
  [normalizeText("Từ này nghĩa là cái bát.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_bowl_success_8f6e43ba.wav",
    text: "Từ này nghĩa là cái bát.",
  },
  [normalizeText("Mình học câu ăn trưa nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_eat_lunch_8e2c9458.wav",
    text: "Mình học câu ăn trưa nhé.",
  },
  [normalizeText("Câu này nghĩa là ăn trưa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_eat_lunch_success_2199c2fc.wav",
    text: "Câu này nghĩa là ăn trưa.",
  },
  [normalizeText("Đây là cái nĩa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_fork_497fe2d7.wav",
    text: "Đây là cái nĩa.",
  },
  [normalizeText("Từ này nghĩa là cái nĩa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_fork_success_6fa6defe.wav",
    text: "Từ này nghĩa là cái nĩa.",
  },
  [normalizeText("Mình học câu mở hộp cơm nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_open_lunchbox_0eec972a.wav",
    text: "Mình học câu mở hộp cơm nhé.",
  },
  [normalizeText("Câu này nghĩa là mở hộp cơm.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_open_lunchbox_success_d955d140.wav",
    text: "Câu này nghĩa là mở hộp cơm.",
  },
  [normalizeText("Đây là cơm.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_rice_a4c9f9c1.wav",
    text: "Đây là cơm.",
  },
  [normalizeText("Từ này nghĩa là cơm.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_rice_success_1f8587a3.wav",
    text: "Từ này nghĩa là cơm.",
  },
  [normalizeText("Đây là canh.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_soup_54f47a65.wav",
    text: "Đây là canh.",
  },
  [normalizeText("Từ này nghĩa là canh.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_soup_success_f8c1a0fb.wav",
    text: "Từ này nghĩa là canh.",
  },
  [normalizeText("Đây là cái thìa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_spoon_0a6d1281.wav",
    text: "Đây là cái thìa.",
  },
  [normalizeText("Từ này nghĩa là cái thìa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_spoon_success_53ac66cf.wav",
    text: "Từ này nghĩa là cái thìa.",
  },
  [normalizeText("Mình học câu dùng thìa nhé.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_use_spoon_7ddcff73.wav",
    text: "Mình học câu dùng thìa nhé.",
  },
  [normalizeText("Câu này nghĩa là dùng thìa.")]: {
    key: "lessons/lunch-time/lunch-box/audio/vi/lunchbox_teach_use_spoon_success_a57cc592.wav",
    text: "Câu này nghĩa là dùng thìa.",
  },
  [normalizeText("Bé đã biết ăn trưa cùng bạn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/completion_aebd2395.wav",
    text: "Bé đã biết ăn trưa cùng bạn.",
  },
  [normalizeText("Đưa ghế vào chỗ ngồi.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_chair_to_seat_2608af29.wav",
    text: "Đưa ghế vào chỗ ngồi.",
  },
  [normalizeText("Đưa ghế tới vị trí ngồi bên bàn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_chair_to_seat_fail_314d783e.wav",
    text: "Đưa ghế tới vị trí ngồi bên bàn nhé.",
  },
  [normalizeText("Bé đã ngồi vào bàn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_chair_to_seat_success_d89480c7.wav",
    text: "Bé đã ngồi vào bàn.",
  },
  [normalizeText("Kéo ghế tới bàn ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_chair_to_table_c9376413.wav",
    text: "Kéo ghế tới bàn ăn.",
  },
  [normalizeText("Kéo ghế tới gần bàn ăn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_chair_to_table_fail_81370bf7.wav",
    text: "Kéo ghế tới gần bàn ăn nhé.",
  },
  [normalizeText("Ghế đã ở cạnh bàn ăn rồi!")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_chair_to_table_success_d890d634.wav",
    text: "Ghế đã ở cạnh bàn ăn rồi!",
  },
  [normalizeText("Chia sẻ trái cây với bạn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_fruit_to_friend_602b7bfd.wav",
    text: "Chia sẻ trái cây với bạn.",
  },
  [normalizeText("Đưa trái cây tới bạn để chia sẻ nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_fruit_to_friend_fail_99cfe60c.wav",
    text: "Đưa trái cây tới bạn để chia sẻ nhé.",
  },
  [normalizeText("Bé chia sẻ đồ ăn rất ngoan!")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_fruit_to_friend_success_477592eb.wav",
    text: "Bé chia sẻ đồ ăn rất ngoan!",
  },
  [normalizeText("Đặt trái cây lên bàn ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_fruit_to_table_5f8ef5da.wav",
    text: "Đặt trái cây lên bàn ăn.",
  },
  [normalizeText("Đặt trái cây lên bàn ăn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_fruit_to_table_fail_587e9b05.wav",
    text: "Đặt trái cây lên bàn ăn nhé.",
  },
  [normalizeText("Trái cây đã sẵn sàng!")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_fruit_to_table_success_d50617f9.wav",
    text: "Trái cây đã sẵn sàng!",
  },
  [normalizeText("Đặt khăn giấy lên bàn ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_napkin_to_table_3a1f02d6.wav",
    text: "Đặt khăn giấy lên bàn ăn.",
  },
  [normalizeText("Đặt khăn giấy lên bàn ăn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_napkin_to_table_fail_093f9f46.wav",
    text: "Đặt khăn giấy lên bàn ăn nhé.",
  },
  [normalizeText("Khăn giấy đã ở trên bàn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_drag_napkin_to_table_success_6d28e254.wav",
    text: "Khăn giấy đã ở trên bàn.",
  },
  [normalizeText("Mình ăn trưa cùng bạn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_intro_46eeae00.wav",
    text: "Mình ăn trưa cùng bạn nhé.",
  },
  [normalizeText("Cùng ngồi vào bàn nào!")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_intro_success_4b775148.wav",
    text: "Cùng ngồi vào bàn nào!",
  },
  [normalizeText("Chạm vào cái cốc nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_cup_2cfad55f.wav",
    text: "Chạm vào cái cốc nhé.",
  },
  [normalizeText("Cái cốc nằm trên bàn ăn đó.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_cup_fail_70479e53.wav",
    text: "Cái cốc nằm trên bàn ăn đó.",
  },
  [normalizeText("Đúng rồi, đó là cái cốc.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_cup_success_2ba0651a.wav",
    text: "Đúng rồi, đó là cái cốc.",
  },
  [normalizeText("Bạn đang ngồi bên phải đó.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_friend_fail_ffcf5c50.wav",
    text: "Bạn đang ngồi bên phải đó.",
  },
  [normalizeText("Chạm vào bàn ăn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_table_7462748a.wav",
    text: "Chạm vào bàn ăn nhé.",
  },
  [normalizeText("Bàn ăn ở giữa phòng đó.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_table_fail_374e4d45.wav",
    text: "Bàn ăn ở giữa phòng đó.",
  },
  [normalizeText("Đúng rồi, đó là bàn ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_table_success_568c8e23.wav",
    text: "Đúng rồi, đó là bàn ăn.",
  },
  [normalizeText("Chạm thẻ cảm ơn để nói lời cảm ơn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_thanks_card_76711c17.wav",
    text: "Chạm thẻ cảm ơn để nói lời cảm ơn.",
  },
  [normalizeText("Chạm thẻ cảm ơn cạnh bạn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_thanks_card_fail_1ec1ac72.wav",
    text: "Chạm thẻ cảm ơn cạnh bạn nhé.",
  },
  [normalizeText("Bé nói cảm ơn thật lễ phép!")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_tap_thanks_card_success_ce349183.wav",
    text: "Bé nói cảm ơn thật lễ phép!",
  },
  [normalizeText("Đây là trái cây.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_fruit_7c332fa9.wav",
    text: "Đây là trái cây.",
  },
  [normalizeText("Từ này nghĩa là trái cây.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_fruit_success_1545d4c4.wav",
    text: "Từ này nghĩa là trái cây.",
  },
  [normalizeText("Đây là khăn giấy.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_napkin_43f41ef3.wav",
    text: "Đây là khăn giấy.",
  },
  [normalizeText("Từ này nghĩa là khăn giấy.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_napkin_success_c0a4d55a.wav",
    text: "Từ này nghĩa là khăn giấy.",
  },
  [normalizeText("Mình học câu nói lời cảm ơn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_say_thank_you_da6034af.wav",
    text: "Mình học câu nói lời cảm ơn nhé.",
  },
  [normalizeText("Câu này nghĩa là nói lời cảm ơn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_say_thank_you_success_2060952c.wav",
    text: "Câu này nghĩa là nói lời cảm ơn.",
  },
  [normalizeText("Mình học câu chia sẻ đồ ăn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_share_food_10aec35a.wav",
    text: "Mình học câu chia sẻ đồ ăn nhé.",
  },
  [normalizeText("Câu này nghĩa là chia sẻ đồ ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_share_food_success_5b01836c.wav",
    text: "Câu này nghĩa là chia sẻ đồ ăn.",
  },
  [normalizeText("Mình học câu ngồi vào bàn nhé.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_sit_at_table_3ec2c69f.wav",
    text: "Mình học câu ngồi vào bàn nhé.",
  },
  [normalizeText("Câu này nghĩa là ngồi vào bàn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_sit_at_table_success_d3249b21.wav",
    text: "Câu này nghĩa là ngồi vào bàn.",
  },
  [normalizeText("Đây là bàn ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_table_d12acac4.wav",
    text: "Đây là bàn ăn.",
  },
  [normalizeText("Từ này nghĩa là bàn ăn.")]: {
    key: "lessons/lunch-time/lunch-table/audio/vi/lunchtable_teach_table_success_ab835110.wav",
    text: "Từ này nghĩa là bàn ăn.",
  },
  [normalizeText("Bé đã vệ sinh thật tốt.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/completion.wav",
    text: "Bé đã vệ sinh thật tốt.",
  },
  [normalizeText("Kéo xà phòng tới tay bé nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_soap_to_hand_fail.wav",
    text: "Kéo xà phòng tới tay bé nhé.",
  },
  [normalizeText("Tay bé sạch hơn rồi!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_soap_to_hand_success.wav",
    text: "Tay bé sạch hơn rồi!",
  },
  [normalizeText("Đưa xà phòng tới tay bé nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_soap_to_hand.wav",
    text: "Đưa xà phòng tới tay bé nhé.",
  },
  [normalizeText("Kéo bàn chải tới miệng bé nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_toothbrush_fail.wav",
    text: "Kéo bàn chải tới miệng bé nhé.",
  },
  [normalizeText("Răng sạch rồi!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_toothbrush_success.wav",
    text: "Răng sạch rồi!",
  },
  [normalizeText("Kéo bàn chải tới miệng bé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_toothbrush.wav",
    text: "Kéo bàn chải tới miệng bé.",
  },
  [normalizeText("Kéo kem đánh răng tới bàn chải nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_toothpaste_to_brush_fail.wav",
    text: "Kéo kem đánh răng tới bàn chải nhé.",
  },
  [normalizeText("Bàn chải đã có kem rồi!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_toothpaste_to_brush_success.wav",
    text: "Bàn chải đã có kem rồi!",
  },
  [normalizeText("Cho kem đánh răng lên bàn chải nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_toothpaste_to_brush.wav",
    text: "Cho kem đánh răng lên bàn chải nhé.",
  },
  [normalizeText("Kéo nước tới mặt bé nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_water_to_face_fail.wav",
    text: "Kéo nước tới mặt bé nhé.",
  },
  [normalizeText("Mặt bé sạch hơn rồi!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_water_to_face_success.wav",
    text: "Mặt bé sạch hơn rồi!",
  },
  [normalizeText("Kéo nước tới mặt bé để rửa mặt.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/drag_water_to_face.wav",
    text: "Kéo nước tới mặt bé để rửa mặt.",
  },
  [normalizeText("Sạch sẽ nào!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/intro_success.wav",
    text: "Sạch sẽ nào!",
  },
  [normalizeText("Mình vào phòng tắm nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/intro.wav",
    text: "Mình vào phòng tắm nhé.",
  },
  [normalizeText("Gương ở phía trên bồn rửa đó.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/review_mirror_fail.wav",
    text: "Gương ở phía trên bồn rửa đó.",
  },
  [normalizeText("Bé sạch sẽ và sẵn sàng rồi!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/review_mirror_success.wav",
    text: "Bé sạch sẽ và sẵn sàng rồi!",
  },
  [normalizeText("Chạm vào cái gương để kiểm tra nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/review_mirror.wav",
    text: "Chạm vào cái gương để kiểm tra nhé.",
  },
  [normalizeText("Mặt sạch rồi!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/review_towel_success.wav",
    text: "Mặt sạch rồi!",
  },
  [normalizeText("Kéo khăn tới mặt bé nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/review_towel.wav",
    text: "Kéo khăn tới mặt bé nhé.",
  },
  [normalizeText("Bồn rửa ở phía bên phải đó.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_sink_fail.wav",
    text: "Bồn rửa ở phía bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là bồn rửa.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_sink_success.wav",
    text: "Đúng rồi, đó là bồn rửa.",
  },
  [normalizeText("Chạm vào bồn rửa nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_sink.wav",
    text: "Chạm vào bồn rửa nhé.",
  },
  [normalizeText("Bàn chải ở cạnh bồn rửa đó.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_toothbrush_fail.wav",
    text: "Bàn chải ở cạnh bồn rửa đó.",
  },
  [normalizeText("Chạm vào bàn chải nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_toothbrush.wav",
    text: "Chạm vào bàn chải nhé.",
  },
  [normalizeText("Nước ở gần bồn đó.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_water_fail.wav",
    text: "Nước ở gần bồn đó.",
  },
  [normalizeText("Mát quá!")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_water_success.wav",
    text: "Mát quá!",
  },
  [normalizeText("Chạm vào nước nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/tap_water.wav",
    text: "Chạm vào nước nhé.",
  },
  [normalizeText("Câu này nghĩa là đánh răng.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_brush_teeth_success.wav",
    text: "Câu này nghĩa là đánh răng.",
  },
  [normalizeText("Mình học câu đánh răng nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_brush_teeth.wav",
    text: "Mình học câu đánh răng nhé.",
  },
  [normalizeText("Câu này nghĩa là lau mặt.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_dry_face_success.wav",
    text: "Câu này nghĩa là lau mặt.",
  },
  [normalizeText("Mình học câu lau mặt nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_dry_face.wav",
    text: "Mình học câu lau mặt nhé.",
  },
  [normalizeText("Từ này nghĩa là cái gương.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_mirror_success.wav",
    text: "Từ này nghĩa là cái gương.",
  },
  [normalizeText("Sau khi lau mặt, mình nhìn gương nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_mirror.wav",
    text: "Sau khi lau mặt, mình nhìn gương nhé.",
  },
  [normalizeText("Từ này nghĩa là bồn rửa.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_sink_success.wav",
    text: "Từ này nghĩa là bồn rửa.",
  },
  [normalizeText("Bồn rửa ở cạnh bé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_sink.wav",
    text: "Bồn rửa ở cạnh bé.",
  },
  [normalizeText("Từ này nghĩa là xà phòng.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_soap_success.wav",
    text: "Từ này nghĩa là xà phòng.",
  },
  [normalizeText("Đây là xà phòng.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_soap.wav",
    text: "Đây là xà phòng.",
  },
  [normalizeText("Đây là bàn chải đánh răng.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_toothbrush_success.wav",
    text: "Đây là bàn chải đánh răng.",
  },
  [normalizeText("Mình bắt đầu với bàn chải nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_toothbrush.wav",
    text: "Mình bắt đầu với bàn chải nhé.",
  },
  [normalizeText("Từ này nghĩa là kem đánh răng.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_toothpaste_success.wav",
    text: "Từ này nghĩa là kem đánh răng.",
  },
  [normalizeText("Đây là kem đánh răng.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_toothpaste.wav",
    text: "Đây là kem đánh răng.",
  },
  [normalizeText("Đây là khăn mặt.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_towel_success.wav",
    text: "Đây là khăn mặt.",
  },
  [normalizeText("Bây giờ mình lấy khăn nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_towel.wav",
    text: "Bây giờ mình lấy khăn nhé.",
  },
  [normalizeText("Câu này nghĩa là rửa mặt.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_wash_face_success.wav",
    text: "Câu này nghĩa là rửa mặt.",
  },
  [normalizeText("Mình học câu rửa mặt nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_wash_face.wav",
    text: "Mình học câu rửa mặt nhé.",
  },
  [normalizeText("Đây là nước.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_water_success.wav",
    text: "Đây là nước.",
  },
  [normalizeText("Tiếp theo là nước nhé.")]: {
    key: "lessons/morning-routine/bathroom/audio/vi/teach_water.wav",
    text: "Tiếp theo là nước nhé.",
  },
  [normalizeText("Đây là cái giường.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/bed_meaning.wav",
    text: "Đây là cái giường.",
  },
  [normalizeText("Đây là cái chăn.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/blanket_meaning.wav",
    text: "Đây là cái chăn.",
  },
  [normalizeText("Gọn gàng quá!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/blanket_success.wav",
    text: "Gọn gàng quá!",
  },
  [normalizeText("Từ này nghĩa là cái hộp.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/box_meaning.wav",
    text: "Từ này nghĩa là cái hộp.",
  },
  [normalizeText("Đúng rồi, đó là cái hộp.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/box_success.wav",
    text: "Đúng rồi, đó là cái hộp.",
  },
  [normalizeText("Từ này nghĩa là đồng hồ.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/clock_meaning.wav",
    text: "Từ này nghĩa là đồng hồ.",
  },
  [normalizeText("Đúng rồi, đó là đồng hồ.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/clock_success.wav",
    text: "Đúng rồi, đó là đồng hồ.",
  },
  [normalizeText("Bé đã dọn phòng ngủ.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/completion.wav",
    text: "Bé đã dọn phòng ngủ.",
  },
  [normalizeText("Từ này nghĩa là búp bê.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/doll_meaning.wav",
    text: "Từ này nghĩa là búp bê.",
  },
  [normalizeText("Đúng rồi, đó là búp bê.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/doll_success.wav",
    text: "Đúng rồi, đó là búp bê.",
  },
  [normalizeText("Kéo chăn vào vùng sáng nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_blanket_fail.wav",
    text: "Kéo chăn vào vùng sáng nhé.",
  },
  [normalizeText("Kéo chăn vào cái hộp nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box_fail.wav",
    text: "Kéo chăn vào cái hộp nhé.",
  },
  [normalizeText("Cất chăn vào hộp để dọn giường nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box.wav",
    text: "Cất chăn vào hộp để dọn giường nhé.",
  },
  [normalizeText("Kéo chăn gọn nào.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_blanket.wav",
    text: "Kéo chăn gọn nào.",
  },
  [normalizeText("Kéo gối vào cái hộp nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box_fail.wav",
    text: "Kéo gối vào cái hộp nhé.",
  },
  [normalizeText("Cất gối vào hộp nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box.wav",
    text: "Cất gối vào hộp nhé.",
  },
  [normalizeText("Kéo tất vào cái hộp nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box_fail.wav",
    text: "Kéo tất vào cái hộp nhé.",
  },
  [normalizeText("Cất tất vào hộp nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box.wav",
    text: "Cất tất vào hộp nhé.",
  },
  [normalizeText("Câu này nghĩa là chào buổi sáng.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/good_morning_meaning.wav",
    text: "Câu này nghĩa là chào buổi sáng.",
  },
  [normalizeText("Bé dậy ngoan quá!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/intro_success.wav",
    text: "Bé dậy ngoan quá!",
  },
  [normalizeText("Chào buổi sáng!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/intro.wav",
    text: "Chào buổi sáng!",
  },
  [normalizeText("Từ này nghĩa là đèn ngủ.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/lamp_meaning.wav",
    text: "Từ này nghĩa là đèn ngủ.",
  },
  [normalizeText("Con tìm thấy đèn ngủ rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/lamp_success.wav",
    text: "Con tìm thấy đèn ngủ rồi!",
  },
  [normalizeText("Câu này nghĩa là dọn giường.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/make_the_bed_meaning.wav",
    text: "Câu này nghĩa là dọn giường.",
  },
  [normalizeText("Giường gọn gàng rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/make_the_bed_success.wav",
    text: "Giường gọn gàng rồi!",
  },
  [normalizeText("Gối đã ở trong hộp rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/pillow_in_box_success.wav",
    text: "Gối đã ở trong hộp rồi!",
  },
  [normalizeText("Đây là cái gối.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/pillow_meaning.wav",
    text: "Đây là cái gối.",
  },
  [normalizeText("Đúng rồi, đó là cái gối.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/pillow_success.wav",
    text: "Đúng rồi, đó là cái gối.",
  },
  [normalizeText("Đúng rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/practice_bed_success.wav",
    text: "Đúng rồi!",
  },
  [normalizeText("Tất đã ở trong hộp rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/socks_in_box_success.wav",
    text: "Tất đã ở trong hộp rồi!",
  },
  [normalizeText("Từ này nghĩa là đôi tất.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/socks_meaning.wav",
    text: "Từ này nghĩa là đôi tất.",
  },
  [normalizeText("Con tìm thấy đôi tất rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/socks_success.wav",
    text: "Con tìm thấy đôi tất rồi!",
  },
  [normalizeText("Mặt trời đang ở trên cao đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/sun_fail.wav",
    text: "Mặt trời đang ở trên cao đó.",
  },
  [normalizeText("Đây là mặt trời.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/sun_meaning.wav",
    text: "Đây là mặt trời.",
  },
  [normalizeText("Phòng sáng rồi!")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/sun_success.wav",
    text: "Phòng sáng rồi!",
  },
  [normalizeText("Thử chạm cái giường nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_bed_fail.wav",
    text: "Thử chạm cái giường nhé.",
  },
  [normalizeText("Chạm vào cái giường nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_bed.wav",
    text: "Chạm vào cái giường nhé.",
  },
  [normalizeText("Cái hộp ở bên phải đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_box_fail.wav",
    text: "Cái hộp ở bên phải đó.",
  },
  [normalizeText("Chạm vào cái hộp nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_box.wav",
    text: "Chạm vào cái hộp nhé.",
  },
  [normalizeText("Đồng hồ ở trên tường đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_clock_fail.wav",
    text: "Đồng hồ ở trên tường đó.",
  },
  [normalizeText("Chạm vào đồng hồ nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_clock.wav",
    text: "Chạm vào đồng hồ nhé.",
  },
  [normalizeText("Búp bê ở cạnh giường đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_doll_fail.wav",
    text: "Búp bê ở cạnh giường đó.",
  },
  [normalizeText("Chạm vào búp bê nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_doll.wav",
    text: "Chạm vào búp bê nhé.",
  },
  [normalizeText("Đèn ngủ ở cạnh giường đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_lamp_fail.wav",
    text: "Đèn ngủ ở cạnh giường đó.",
  },
  [normalizeText("Chạm vào đèn ngủ nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_lamp.wav",
    text: "Chạm vào đèn ngủ nhé.",
  },
  [normalizeText("Gối ở trên giường đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_pillow_fail.wav",
    text: "Gối ở trên giường đó.",
  },
  [normalizeText("Chạm vào cái gối nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_pillow.wav",
    text: "Chạm vào cái gối nhé.",
  },
  [normalizeText("Đôi tất ở gần giường đó.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_socks_fail.wav",
    text: "Đôi tất ở gần giường đó.",
  },
  [normalizeText("Chạm vào đôi tất nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_socks.wav",
    text: "Chạm vào đôi tất nhé.",
  },
  [normalizeText("Chạm vào mặt trời cho sáng nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/tap_sun.wav",
    text: "Chạm vào mặt trời cho sáng nhé.",
  },
  [normalizeText("Mình bắt đầu với cái giường nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_bed_intro.wav",
    text: "Mình bắt đầu với cái giường nhé.",
  },
  [normalizeText("Tiếp theo là cái chăn nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_blanket_intro.wav",
    text: "Tiếp theo là cái chăn nhé.",
  },
  [normalizeText("Đây là cái hộp.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_box_intro.wav",
    text: "Đây là cái hộp.",
  },
  [normalizeText("Trên tường có cái đồng hồ.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_clock_intro.wav",
    text: "Trên tường có cái đồng hồ.",
  },
  [normalizeText("Đây là búp bê.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_doll_intro.wav",
    text: "Đây là búp bê.",
  },
  [normalizeText("Mình cùng chào buổi sáng nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_good_morning_intro.wav",
    text: "Mình cùng chào buổi sáng nhé.",
  },
  [normalizeText("Đây là cái đèn ngủ.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_lamp_intro.wav",
    text: "Đây là cái đèn ngủ.",
  },
  [normalizeText("Mình học câu dọn giường nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_make_the_bed_intro.wav",
    text: "Mình học câu dọn giường nhé.",
  },
  [normalizeText("Trên giường có cái gối.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_pillow_intro.wav",
    text: "Trên giường có cái gối.",
  },
  [normalizeText("Đây là đôi tất.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_socks_intro.wav",
    text: "Đây là đôi tất.",
  },
  [normalizeText("Bây giờ mình nhìn mặt trời nhé.")]: {
    key: "lessons/morning-routine/bedroom/audio/vi/teach_sun_intro.wav",
    text: "Bây giờ mình nhìn mặt trời nhé.",
  },
  [normalizeText("Bé đã ăn sáng vui vẻ.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/completion.wav",
    text: "Bé đã ăn sáng vui vẻ.",
  },
  [normalizeText("Kéo quả táo tới bàn.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_apple_71dab50b.wav",
    text: "Kéo quả táo tới bàn.",
  },
  [normalizeText("Kéo táo tới bàn nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_apple_fail.wav",
    text: "Kéo táo tới bàn nhé.",
  },
  [normalizeText("Táo lên bàn rồi!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_apple_success.wav",
    text: "Táo lên bàn rồi!",
  },
  [normalizeText("Kéo táo vào cái đĩa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_apple_to_plate_fail.wav",
    text: "Kéo táo vào cái đĩa nhé.",
  },
  [normalizeText("Táo ở trên đĩa rồi!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_apple_to_plate_success.wav",
    text: "Táo ở trên đĩa rồi!",
  },
  [normalizeText("Đặt táo vào đĩa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_apple_to_plate.wav",
    text: "Đặt táo vào đĩa nhé.",
  },
  [normalizeText("Kéo chuối vào cái đĩa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_banana_to_plate_fail.wav",
    text: "Kéo chuối vào cái đĩa nhé.",
  },
  [normalizeText("Chuối đã ở trên đĩa rồi!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_banana_to_plate_success.wav",
    text: "Chuối đã ở trên đĩa rồi!",
  },
  [normalizeText("Đặt chuối vào đĩa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_banana_to_plate.wav",
    text: "Đặt chuối vào đĩa nhé.",
  },
  [normalizeText("Đưa bánh mì tới miệng bé nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_bread_to_mouth_fail.wav",
    text: "Đưa bánh mì tới miệng bé nhé.",
  },
  [normalizeText("Bé ăn sáng ngon lành!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_bread_to_mouth_success.wav",
    text: "Bé ăn sáng ngon lành!",
  },
  [normalizeText("Đưa bánh mì tới bé để ăn sáng nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_bread_to_mouth.wav",
    text: "Đưa bánh mì tới bé để ăn sáng nhé.",
  },
  [normalizeText("Kéo sữa tới cái cốc nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_milk_to_cup_fail.wav",
    text: "Kéo sữa tới cái cốc nhé.",
  },
  [normalizeText("Sữa đã vào cốc rồi!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_milk_to_cup_success.wav",
    text: "Sữa đã vào cốc rồi!",
  },
  [normalizeText("Rót sữa vào cốc nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/drag_milk_to_cup.wav",
    text: "Rót sữa vào cốc nhé.",
  },
  [normalizeText("Ngon quá!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/intro_success.wav",
    text: "Ngon quá!",
  },
  [normalizeText("Ăn sáng thôi nào.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/intro.wav",
    text: "Ăn sáng thôi nào.",
  },
  [normalizeText("Chạm bánh mì nào.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/review_bread_6f31c685.wav",
    text: "Chạm bánh mì nào.",
  },
  [normalizeText("Bánh mì ở trước mặt bé đó.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/review_bread_fail.wav",
    text: "Bánh mì ở trước mặt bé đó.",
  },
  [normalizeText("Đúng rồi, đó là bánh mì!")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/review_bread_success_955c7094.wav",
    text: "Đúng rồi, đó là bánh mì!",
  },
  [normalizeText("Quả trứng ở bên trái bàn đó.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/tap_egg_fail.wav",
    text: "Quả trứng ở bên trái bàn đó.",
  },
  [normalizeText("Đúng rồi, đó là quả trứng.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/tap_egg_success.wav",
    text: "Đúng rồi, đó là quả trứng.",
  },
  [normalizeText("Chạm vào quả trứng nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/tap_egg.wav",
    text: "Chạm vào quả trứng nhé.",
  },
  [normalizeText("Chạm vào hộp sữa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/tap_milk_676b04ee.wav",
    text: "Chạm vào hộp sữa nhé.",
  },
  [normalizeText("Chạm hộp sữa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/tap_milk_fail.wav",
    text: "Chạm hộp sữa nhé.",
  },
  [normalizeText("Đúng rồi, đó là hộp sữa.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/tap_milk_success_175b758a.wav",
    text: "Đúng rồi, đó là hộp sữa.",
  },
  [normalizeText("Đây là quả táo.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_apple_962115c2.wav",
    text: "Đây là quả táo.",
  },
  [normalizeText("Từ này nghĩa là quả táo.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_apple_success_95e14973.wav",
    text: "Từ này nghĩa là quả táo.",
  },
  [normalizeText("Từ này nghĩa là quả chuối.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_banana_success.wav",
    text: "Từ này nghĩa là quả chuối.",
  },
  [normalizeText("Đây là quả chuối.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_banana.wav",
    text: "Đây là quả chuối.",
  },
  [normalizeText("Từ này nghĩa là cái cốc.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_cup_success.wav",
    text: "Từ này nghĩa là cái cốc.",
  },
  [normalizeText("Đây là cái cốc.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_cup.wav",
    text: "Đây là cái cốc.",
  },
  [normalizeText("Câu này nghĩa là ăn sáng.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_eat_breakfast_success.wav",
    text: "Câu này nghĩa là ăn sáng.",
  },
  [normalizeText("Mình học câu ăn sáng nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_eat_breakfast.wav",
    text: "Mình học câu ăn sáng nhé.",
  },
  [normalizeText("Từ này nghĩa là quả trứng.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_egg_success.wav",
    text: "Từ này nghĩa là quả trứng.",
  },
  [normalizeText("Đây là quả trứng.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_egg.wav",
    text: "Đây là quả trứng.",
  },
  [normalizeText("Đây là sữa.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_milk_2c23e9f7.wav",
    text: "Đây là sữa.",
  },
  [normalizeText("Từ này nghĩa là sữa.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_milk_success_0c966875.wav",
    text: "Từ này nghĩa là sữa.",
  },
  [normalizeText("Từ này nghĩa là cái đĩa.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_plate_success.wav",
    text: "Từ này nghĩa là cái đĩa.",
  },
  [normalizeText("Đây là cái đĩa.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_plate.wav",
    text: "Đây là cái đĩa.",
  },
  [normalizeText("Câu này nghĩa là rót sữa.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_pour_milk_success.wav",
    text: "Câu này nghĩa là rót sữa.",
  },
  [normalizeText("Mình học câu rót sữa nhé.")]: {
    key: "lessons/morning-routine/breakfast/audio/vi/teach_pour_milk.wav",
    text: "Mình học câu rót sữa nhé.",
  },
  [normalizeText("Bé đã sẵn sàng đi học.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/completion.wav",
    text: "Bé đã sẵn sàng đi học.",
  },
  [normalizeText("Kéo cặp sách tới tay.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_bag_f539e810.wav",
    text: "Kéo cặp sách tới tay.",
  },
  [normalizeText("Kéo cặp tới tay nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_bag_fail.wav",
    text: "Kéo cặp tới tay nhé.",
  },
  [normalizeText("Cầm cặp rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_bag_success.wav",
    text: "Cầm cặp rồi!",
  },
  [normalizeText("Đặt quyển sách vào cặp nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_book_to_bag_649402b3.wav",
    text: "Đặt quyển sách vào cặp nhé.",
  },
  [normalizeText("Kéo quyển sách vào cặp nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_book_to_bag_fail.wav",
    text: "Kéo quyển sách vào cặp nhé.",
  },
  [normalizeText("Sách đã vào cặp rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_book_to_bag_success.wav",
    text: "Sách đã vào cặp rồi!",
  },
  [normalizeText("Đặt hộp cơm vào cặp nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_lunchbox_to_bag_803d8aae.wav",
    text: "Đặt hộp cơm vào cặp nhé.",
  },
  [normalizeText("Kéo hộp cơm vào cặp nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_lunchbox_to_bag_fail.wav",
    text: "Kéo hộp cơm vào cặp nhé.",
  },
  [normalizeText("Hộp cơm đã vào cặp rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_lunchbox_to_bag_success.wav",
    text: "Hộp cơm đã vào cặp rồi!",
  },
  [normalizeText("Kéo giày tới chân bé nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_shoes_to_feet_fail.wav",
    text: "Kéo giày tới chân bé nhé.",
  },
  [normalizeText("Bé đã mang giày rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_shoes_to_feet_success.wav",
    text: "Bé đã mang giày rồi!",
  },
  [normalizeText("Mang giày cho bé nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_drag_shoes_to_feet.wav",
    text: "Mang giày cho bé nhé.",
  },
  [normalizeText("Sẵn sàng rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_intro_success.wav",
    text: "Sẵn sàng rồi!",
  },
  [normalizeText("Mình đi học nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_intro.wav",
    text: "Mình đi học nhé.",
  },
  [normalizeText("Chạm vào trường học nào.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_review_school_ca20b33f.wav",
    text: "Chạm vào trường học nào.",
  },
  [normalizeText("Trường học ở bên phải.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_review_school_fail.wav",
    text: "Trường học ở bên phải.",
  },
  [normalizeText("Tới trường thôi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_review_school_success.wav",
    text: "Tới trường thôi!",
  },
  [normalizeText("Chạm vào xe buýt nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_bus_b05d07c2.wav",
    text: "Chạm vào xe buýt nhé.",
  },
  [normalizeText("Xe buýt ở gần trường đó.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_bus_fail.wav",
    text: "Xe buýt ở gần trường đó.",
  },
  [normalizeText("Xe buýt tới rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_bus_success.wav",
    text: "Xe buýt tới rồi!",
  },
  [normalizeText("Chạm vào đôi giày nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_shoes_5023c86b.wav",
    text: "Chạm vào đôi giày nhé.",
  },
  [normalizeText("Giày ở dưới chân đó.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_shoes_fail.wav",
    text: "Giày ở dưới chân đó.",
  },
  [normalizeText("Đúng rồi, đó là đôi giày.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_shoes_success_95027701.wav",
    text: "Đúng rồi, đó là đôi giày.",
  },
  [normalizeText("Chạm vào đồng phục nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_uniform_c247b728.wav",
    text: "Chạm vào đồng phục nhé.",
  },
  [normalizeText("Đồng phục ở bên trái bé đó.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_uniform_fail.wav",
    text: "Đồng phục ở bên trái bé đó.",
  },
  [normalizeText("Mặc đồng phục rồi!")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_tap_uniform_success.wav",
    text: "Mặc đồng phục rồi!",
  },
  [normalizeText("Đây là cặp sách.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_bag_d4d781a4.wav",
    text: "Đây là cặp sách.",
  },
  [normalizeText("Từ này nghĩa là cặp sách.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_bag_success_9547dfba.wav",
    text: "Từ này nghĩa là cặp sách.",
  },
  [normalizeText("Đây là quyển sách.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_book_79589977.wav",
    text: "Đây là quyển sách.",
  },
  [normalizeText("Từ này nghĩa là quyển sách.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_book_success_6c4176ee.wav",
    text: "Từ này nghĩa là quyển sách.",
  },
  [normalizeText("Đây là xe buýt.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_bus_e4ac2b42.wav",
    text: "Đây là xe buýt.",
  },
  [normalizeText("Từ này nghĩa là xe buýt.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_bus_success_d65fc4a7.wav",
    text: "Từ này nghĩa là xe buýt.",
  },
  [normalizeText("Câu này nghĩa là đi học.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_go_to_school_success.wav",
    text: "Câu này nghĩa là đi học.",
  },
  [normalizeText("Mình học câu đi học nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_go_to_school.wav",
    text: "Mình học câu đi học nhé.",
  },
  [normalizeText("Đây là hộp cơm.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_lunchbox_a6a5ec21.wav",
    text: "Đây là hộp cơm.",
  },
  [normalizeText("Từ này nghĩa là hộp cơm.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_lunchbox_success_49e24275.wav",
    text: "Từ này nghĩa là hộp cơm.",
  },
  [normalizeText("Câu này nghĩa là xếp cặp.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_pack_bag_success.wav",
    text: "Câu này nghĩa là xếp cặp.",
  },
  [normalizeText("Mình học câu xếp cặp nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_pack_bag.wav",
    text: "Mình học câu xếp cặp nhé.",
  },
  [normalizeText("Câu này nghĩa là mang giày.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_put_on_shoes_success.wav",
    text: "Câu này nghĩa là mang giày.",
  },
  [normalizeText("Mình học câu mang giày nhé.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_put_on_shoes.wav",
    text: "Mình học câu mang giày nhé.",
  },
  [normalizeText("Đây là đôi giày.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_shoes_7bad9386.wav",
    text: "Đây là đôi giày.",
  },
  [normalizeText("Từ này nghĩa là đôi giày.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_shoes_success_981144a2.wav",
    text: "Từ này nghĩa là đôi giày.",
  },
  [normalizeText("Đây là đồng phục.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_uniform_0494e056.wav",
    text: "Đây là đồng phục.",
  },
  [normalizeText("Từ này nghĩa là đồng phục.")]: {
    key: "lessons/morning-routine/go-to-school/audio/vi/school_teach_uniform_success_ad977d1b.wav",
    text: "Từ này nghĩa là đồng phục.",
  },
  [normalizeText("Bé đã biết chơi vui và chia sẻ với bạn.")]: {
    key: "lessons/playtime/friend-games/audio/vi/completion_ba602849.wav",
    text: "Bé đã biết chơi vui và chia sẻ với bạn.",
  },
  [normalizeText("Đưa khối xếp hình vào thảm để chơi cùng nhau.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_blocks_play_together_2101b3b8.wav",
    text: "Đưa khối xếp hình vào thảm để chơi cùng nhau.",
  },
  [normalizeText("Kéo khối xếp hình vào thảm để chơi cùng nhau nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_blocks_play_together_fail_f2a28a08.wav",
    text: "Kéo khối xếp hình vào thảm để chơi cùng nhau nhé.",
  },
  [normalizeText("Hai bạn chơi cùng nhau rất vui!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_blocks_play_together_success_26d1c4a5.wav",
    text: "Hai bạn chơi cùng nhau rất vui!",
  },
  [normalizeText("Đưa khối xếp hình vào thảm chơi.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_blocks_to_mat_c0078cab.wav",
    text: "Đưa khối xếp hình vào thảm chơi.",
  },
  [normalizeText("Kéo khối xếp hình vào thảm chơi nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_blocks_to_mat_fail_79b0c62d.wav",
    text: "Kéo khối xếp hình vào thảm chơi nhé.",
  },
  [normalizeText("Khối xếp hình đã vào thảm chơi!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_blocks_to_mat_success_46d844f5.wav",
    text: "Khối xếp hình đã vào thảm chơi!",
  },
  [normalizeText("Đưa diều lên trời.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_kite_to_sky_da50b72e.wav",
    text: "Đưa diều lên trời.",
  },
  [normalizeText("Kéo diều lên vùng trời nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_kite_to_sky_fail_b269736d.wav",
    text: "Kéo diều lên vùng trời nhé.",
  },
  [normalizeText("Diều bay lên rồi!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_kite_to_sky_success_f786dae7.wav",
    text: "Diều bay lên rồi!",
  },
  [normalizeText("Chia sẻ đồ chơi với bạn.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_toy_to_friend_769254a3.wav",
    text: "Chia sẻ đồ chơi với bạn.",
  },
  [normalizeText("Kéo đồ chơi tới bạn để cùng chơi nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_toy_to_friend_fail_8ec6b0e0.wav",
    text: "Kéo đồ chơi tới bạn để cùng chơi nhé.",
  },
  [normalizeText("Bé chia sẻ đồ chơi thật ngoan!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_drag_toy_to_friend_success_2c27f653.wav",
    text: "Bé chia sẻ đồ chơi thật ngoan!",
  },
  [normalizeText("Mình chơi cùng bạn nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_intro_b686a8c9.wav",
    text: "Mình chơi cùng bạn nhé.",
  },
  [normalizeText("Có bạn chơi cùng thật vui!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_intro_success_43e38b2d.wav",
    text: "Có bạn chơi cùng thật vui!",
  },
  [normalizeText("Chạm vào cái xô nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_bucket_4a1d50de.wav",
    text: "Chạm vào cái xô nhé.",
  },
  [normalizeText("Cái xô ở phía dưới bên phải đó.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_bucket_fail_a1e4a5df.wav",
    text: "Cái xô ở phía dưới bên phải đó.",
  },
  [normalizeText("Đúng rồi, đó là cái xô.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_bucket_success_9aca6c80.wav",
    text: "Đúng rồi, đó là cái xô.",
  },
  [normalizeText("Chạm vào bạn nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_friend_b4ce0b88.wav",
    text: "Chạm vào bạn nhé.",
  },
  [normalizeText("Bạn đang đứng bên phải đó.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_friend_fail_88791705.wav",
    text: "Bạn đang đứng bên phải đó.",
  },
  [normalizeText("Con tìm thấy bạn rồi!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_friend_success_6b9c9bd4.wav",
    text: "Con tìm thấy bạn rồi!",
  },
  [normalizeText("Chạm vào dây nhảy nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_rope_98e2dc62.wav",
    text: "Chạm vào dây nhảy nhé.",
  },
  [normalizeText("Dây nhảy nằm phía dưới bên trái đó.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_rope_fail_94d70728.wav",
    text: "Dây nhảy nằm phía dưới bên trái đó.",
  },
  [normalizeText("Con tìm thấy dây nhảy rồi!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_rope_success_60bf36c4.wav",
    text: "Con tìm thấy dây nhảy rồi!",
  },
  [normalizeText("Chạm vào đồ chơi nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_toy_457add8b.wav",
    text: "Chạm vào đồ chơi nhé.",
  },
  [normalizeText("Đồ chơi nằm gần giữa sân đó.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_toy_fail_1219d838.wav",
    text: "Đồ chơi nằm gần giữa sân đó.",
  },
  [normalizeText("Đúng rồi, đó là đồ chơi.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_toy_success_c2747afc.wav",
    text: "Đúng rồi, đó là đồ chơi.",
  },
  [normalizeText("Chạm biểu tượng chờ đến lượt.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_wait_clock_830eeea3.wav",
    text: "Chạm biểu tượng chờ đến lượt.",
  },
  [normalizeText("Biểu tượng chờ nằm cạnh thẻ chia sẻ đó.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_wait_clock_fail_402edf5e.wav",
    text: "Biểu tượng chờ nằm cạnh thẻ chia sẻ đó.",
  },
  [normalizeText("Bé biết chờ đến lượt rồi!")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_tap_wait_clock_success_55293935.wav",
    text: "Bé biết chờ đến lượt rồi!",
  },
  [normalizeText("Đây là khối xếp hình.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_blocks_3f7a3d80.wav",
    text: "Đây là khối xếp hình.",
  },
  [normalizeText("Từ này nghĩa là khối xếp hình.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_blocks_success_76399f2a.wav",
    text: "Từ này nghĩa là khối xếp hình.",
  },
  [normalizeText("Đây là cái xô.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_bucket_bde7b353.wav",
    text: "Đây là cái xô.",
  },
  [normalizeText("Từ này nghĩa là cái xô.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_bucket_success_085d639c.wav",
    text: "Từ này nghĩa là cái xô.",
  },
  [normalizeText("Đây là bạn.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_friend_769d3936.wav",
    text: "Đây là bạn.",
  },
  [normalizeText("Từ này nghĩa là bạn.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_friend_success_2015fa8d.wav",
    text: "Từ này nghĩa là bạn.",
  },
  [normalizeText("Đây là diều.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_kite_30f16fb9.wav",
    text: "Đây là diều.",
  },
  [normalizeText("Từ này nghĩa là diều.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_kite_success_4b9eb0c5.wav",
    text: "Từ này nghĩa là diều.",
  },
  [normalizeText("Mình học câu chơi cùng nhau nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_play_together_8f4be462.wav",
    text: "Mình học câu chơi cùng nhau nhé.",
  },
  [normalizeText("Câu này nghĩa là chơi cùng nhau.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_play_together_success_f62c4c68.wav",
    text: "Câu này nghĩa là chơi cùng nhau.",
  },
  [normalizeText("Đây là dây nhảy.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_rope_e6f0fd07.wav",
    text: "Đây là dây nhảy.",
  },
  [normalizeText("Từ này nghĩa là dây nhảy.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_rope_success_b20c0196.wav",
    text: "Từ này nghĩa là dây nhảy.",
  },
  [normalizeText("Mình học câu chia sẻ đồ chơi nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_share_toys_1d843e31.wav",
    text: "Mình học câu chia sẻ đồ chơi nhé.",
  },
  [normalizeText("Câu này nghĩa là chia sẻ đồ chơi.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_share_toys_success_3f2bedb8.wav",
    text: "Câu này nghĩa là chia sẻ đồ chơi.",
  },
  [normalizeText("Đây là đồ chơi.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_toy_3d5a7b32.wav",
    text: "Đây là đồ chơi.",
  },
  [normalizeText("Từ này nghĩa là đồ chơi.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_toy_success_6ff555b4.wav",
    text: "Từ này nghĩa là đồ chơi.",
  },
  [normalizeText("Mình học từ chờ nhé.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_wait_fb3cffa0.wav",
    text: "Mình học từ chờ nhé.",
  },
  [normalizeText("Từ này nghĩa là chờ.")]: {
    key: "lessons/playtime/friend-games/audio/vi/games_teach_wait_success_879ca239.wav",
    text: "Từ này nghĩa là chờ.",
  },
  [normalizeText("Bé đã chơi ở sân trường thật vui.")]: {
    key: "lessons/playtime/playground/audio/vi/completion_d91c0bd7.wav",
    text: "Bé đã chơi ở sân trường thật vui.",
  },
  [normalizeText("Đưa bóng vào vòng lượt chơi.")]: {
    key: "lessons/playtime/playground/audio/vi/drag_ball_to_turn_2e6ce3c7.wav",
    text: "Đưa bóng vào vòng lượt chơi.",
  },
  [normalizeText("Đưa bóng tới vòng lượt chơi nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/drag_ball_to_turn_fail_8705daf5.wav",
    text: "Đưa bóng tới vòng lượt chơi nhé.",
  },
  [normalizeText("Bé biết chờ lượt rồi!")]: {
    key: "lessons/playtime/playground/audio/vi/drag_ball_to_turn_success_3bfb5999.wav",
    text: "Bé biết chờ lượt rồi!",
  },
  [normalizeText("Kéo bóng vào sân chơi.")]: {
    key: "lessons/playtime/playground/audio/vi/drag_ball_to_yard_eebf266f.wav",
    text: "Kéo bóng vào sân chơi.",
  },
  [normalizeText("Kéo bóng vào giữa sân chơi nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/drag_ball_to_yard_fail_170a7e48.wav",
    text: "Kéo bóng vào giữa sân chơi nhé.",
  },
  [normalizeText("Bóng đã vào sân chơi rồi!")]: {
    key: "lessons/playtime/playground/audio/vi/drag_ball_to_yard_success_e078bf25.wav",
    text: "Bóng đã vào sân chơi rồi!",
  },
  [normalizeText("Mình ra sân chơi nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/intro_fc0d520a.wav",
    text: "Mình ra sân chơi nhé.",
  },
  [normalizeText("Sân chơi vui quá!")]: {
    key: "lessons/playtime/playground/audio/vi/intro_success_1644f4fb.wav",
    text: "Sân chơi vui quá!",
  },
  [normalizeText("Chạm vào vòng để nhảy nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_jump_hoop_76b9222b.wav",
    text: "Chạm vào vòng để nhảy nhé.",
  },
  [normalizeText("Vòng nhảy ở phía dưới sân đó.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_jump_hoop_fail_6657066a.wav",
    text: "Vòng nhảy ở phía dưới sân đó.",
  },
  [normalizeText("Bé nhảy qua vòng rồi!")]: {
    key: "lessons/playtime/playground/audio/vi/tap_jump_hoop_success_2d781e23.wav",
    text: "Bé nhảy qua vòng rồi!",
  },
  [normalizeText("Chạm đường chạy để chạy nhẹ.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_run_path_38ffc52a.wav",
    text: "Chạm đường chạy để chạy nhẹ.",
  },
  [normalizeText("Chạm vào đường chạy dưới sân nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_run_path_fail_5ad2569c.wav",
    text: "Chạm vào đường chạy dưới sân nhé.",
  },
  [normalizeText("Bé chạy nhẹ rất an toàn!")]: {
    key: "lessons/playtime/playground/audio/vi/tap_run_path_success_32db2910.wav",
    text: "Bé chạy nhẹ rất an toàn!",
  },
  [normalizeText("Chạm vào hố cát nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_sandbox_6fa7c486.wav",
    text: "Chạm vào hố cát nhé.",
  },
  [normalizeText("Hố cát ở phía dưới bên phải đó.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_sandbox_fail_1015b46d.wav",
    text: "Hố cát ở phía dưới bên phải đó.",
  },
  [normalizeText("Con tìm thấy hố cát rồi!")]: {
    key: "lessons/playtime/playground/audio/vi/tap_sandbox_success_7d5ca553.wav",
    text: "Con tìm thấy hố cát rồi!",
  },
  [normalizeText("Chạm vào bập bênh nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_seesaw_0aed9ee8.wav",
    text: "Chạm vào bập bênh nhé.",
  },
  [normalizeText("Bập bênh nằm gần giữa sân đó.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_seesaw_fail_9e21a564.wav",
    text: "Bập bênh nằm gần giữa sân đó.",
  },
  [normalizeText("Đúng rồi, đó là bập bênh.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_seesaw_success_4eb6ed61.wav",
    text: "Đúng rồi, đó là bập bênh.",
  },
  [normalizeText("Chạm vào cầu trượt nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_slide_d22e8613.wav",
    text: "Chạm vào cầu trượt nhé.",
  },
  [normalizeText("Cầu trượt ở bên phải đó.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_slide_fail_b34b9210.wav",
    text: "Cầu trượt ở bên phải đó.",
  },
  [normalizeText("Con tìm thấy cầu trượt rồi!")]: {
    key: "lessons/playtime/playground/audio/vi/tap_slide_success_e94d6a42.wav",
    text: "Con tìm thấy cầu trượt rồi!",
  },
  [normalizeText("Chạm vào xích đu nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_swing_5a13b18e.wav",
    text: "Chạm vào xích đu nhé.",
  },
  [normalizeText("Xích đu ở bên trái sân chơi đó.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_swing_fail_66696f26.wav",
    text: "Xích đu ở bên trái sân chơi đó.",
  },
  [normalizeText("Đúng rồi, đó là xích đu.")]: {
    key: "lessons/playtime/playground/audio/vi/tap_swing_success_d83cb0ee.wav",
    text: "Đúng rồi, đó là xích đu.",
  },
  [normalizeText("Đây là quả bóng.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_ball_aef40571.wav",
    text: "Đây là quả bóng.",
  },
  [normalizeText("Từ này nghĩa là quả bóng.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_ball_success_0f951d32.wav",
    text: "Từ này nghĩa là quả bóng.",
  },
  [normalizeText("Mình học từ nhảy nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_jump_15d6cbb4.wav",
    text: "Mình học từ nhảy nhé.",
  },
  [normalizeText("Từ này nghĩa là nhảy.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_jump_success_893af856.wav",
    text: "Từ này nghĩa là nhảy.",
  },
  [normalizeText("Đây là sân chơi.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_playground_5303a2cc.wav",
    text: "Đây là sân chơi.",
  },
  [normalizeText("Từ này nghĩa là sân chơi.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_playground_success_411242ca.wav",
    text: "Từ này nghĩa là sân chơi.",
  },
  [normalizeText("Mình học từ chạy nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_run_968f08c8.wav",
    text: "Mình học từ chạy nhé.",
  },
  [normalizeText("Từ này nghĩa là chạy.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_run_success_7c51a89c.wav",
    text: "Từ này nghĩa là chạy.",
  },
  [normalizeText("Đây là hố cát.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_sandbox_e00fd881.wav",
    text: "Đây là hố cát.",
  },
  [normalizeText("Từ này nghĩa là hố cát.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_sandbox_success_c1811183.wav",
    text: "Từ này nghĩa là hố cát.",
  },
  [normalizeText("Đây là bập bênh.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_seesaw_89e01356.wav",
    text: "Đây là bập bênh.",
  },
  [normalizeText("Từ này nghĩa là bập bênh.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_seesaw_success_c7c6a624.wav",
    text: "Từ này nghĩa là bập bênh.",
  },
  [normalizeText("Đây là cầu trượt.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_slide_28755f00.wav",
    text: "Đây là cầu trượt.",
  },
  [normalizeText("Từ này nghĩa là cầu trượt.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_slide_success_9ac6be50.wav",
    text: "Từ này nghĩa là cầu trượt.",
  },
  [normalizeText("Đây là xích đu.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_swing_ac32a5c7.wav",
    text: "Đây là xích đu.",
  },
  [normalizeText("Từ này nghĩa là xích đu.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_swing_success_a7860021.wav",
    text: "Từ này nghĩa là xích đu.",
  },
  [normalizeText("Mình học câu lần lượt chơi nhé.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_take_turns_abf49e6a.wav",
    text: "Mình học câu lần lượt chơi nhé.",
  },
  [normalizeText("Câu này nghĩa là lần lượt chơi.")]: {
    key: "lessons/playtime/playground/audio/vi/teach_take_turns_success_a473acb2.wav",
    text: "Câu này nghĩa là lần lượt chơi.",
  },
  [normalizeText("Bé đã biết nghỉ ngơi sau khi chơi.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/completion_264e290a.wav",
    text: "Bé đã biết nghỉ ngơi sau khi chơi.",
  },
  [normalizeText("Đưa bình nước tới miệng bé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_bottle_to_mouth_9f3d2aca.wav",
    text: "Đưa bình nước tới miệng bé.",
  },
  [normalizeText("Đưa bình nước tới miệng bé nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_bottle_to_mouth_fail_92531371.wav",
    text: "Đưa bình nước tới miệng bé nhé.",
  },
  [normalizeText("Bé uống nước rồi!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_bottle_to_mouth_success_8299ef5d.wav",
    text: "Bé uống nước rồi!",
  },
  [normalizeText("Đưa đồ ăn nhẹ tới miệng bé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_snack_to_mouth_ae08b1d7.wav",
    text: "Đưa đồ ăn nhẹ tới miệng bé.",
  },
  [normalizeText("Đưa đồ ăn nhẹ tới miệng bé nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_snack_to_mouth_fail_2dd80641.wav",
    text: "Đưa đồ ăn nhẹ tới miệng bé nhé.",
  },
  [normalizeText("Bé ăn nhẹ xong rồi!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_snack_to_mouth_success_80a476f7.wav",
    text: "Bé ăn nhẹ xong rồi!",
  },
  [normalizeText("Đặt đồ ăn nhẹ lên bàn.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_snack_to_table_3c36f992.wav",
    text: "Đặt đồ ăn nhẹ lên bàn.",
  },
  [normalizeText("Đưa đồ ăn nhẹ lên bàn nhỏ nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_snack_to_table_fail_0728a7be.wav",
    text: "Đưa đồ ăn nhẹ lên bàn nhỏ nhé.",
  },
  [normalizeText("Đồ ăn nhẹ đã ở trên bàn.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_snack_to_table_success_788892ed.wav",
    text: "Đồ ăn nhẹ đã ở trên bàn.",
  },
  [normalizeText("Lau mặt sau khi chơi nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_towel_to_face_df2f1446.wav",
    text: "Lau mặt sau khi chơi nhé.",
  },
  [normalizeText("Kéo khăn lau tới mặt bé nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_towel_to_face_fail_48bdb1b2.wav",
    text: "Kéo khăn lau tới mặt bé nhé.",
  },
  [normalizeText("Mặt bé sạch và mát rồi!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_drag_towel_to_face_success_a5d0e469.wav",
    text: "Mặt bé sạch và mát rồi!",
  },
  [normalizeText("Chơi xong mình nghỉ một chút nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_intro_d2fc14fc.wav",
    text: "Chơi xong mình nghỉ một chút nhé.",
  },
  [normalizeText("Nghỉ một chút cho khỏe nào!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_intro_success_6429f378.wav",
    text: "Nghỉ một chút cho khỏe nào!",
  },
  [normalizeText("Chạm vào ghế dài nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bench_26fd7562.wav",
    text: "Chạm vào ghế dài nhé.",
  },
  [normalizeText("Ghế dài ở bên phải đó.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bench_fail_75329add.wav",
    text: "Ghế dài ở bên phải đó.",
  },
  [normalizeText("Chạm ghế dài để nghỉ ngơi.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bench_rest_507920db.wav",
    text: "Chạm ghế dài để nghỉ ngơi.",
  },
  [normalizeText("Chọn ghế dài để ngồi nghỉ nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bench_rest_fail_3c6ac5e2.wav",
    text: "Chọn ghế dài để ngồi nghỉ nhé.",
  },
  [normalizeText("Bé đã nghỉ ngơi sau giờ chơi!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bench_rest_success_f351e186.wav",
    text: "Bé đã nghỉ ngơi sau giờ chơi!",
  },
  [normalizeText("Con tìm thấy ghế dài rồi!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bench_success_99c52cfa.wav",
    text: "Con tìm thấy ghế dài rồi!",
  },
  [normalizeText("Chạm vào bình nước nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bottle_20fff68e.wav",
    text: "Chạm vào bình nước nhé.",
  },
  [normalizeText("Bình nước ở cạnh cốc nước đó.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bottle_fail_a717151d.wav",
    text: "Bình nước ở cạnh cốc nước đó.",
  },
  [normalizeText("Đúng rồi, đó là bình nước.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_bottle_success_1c1b802a.wav",
    text: "Đúng rồi, đó là bình nước.",
  },
  [normalizeText("Chạm vào bóng râm nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_shade_6b0efe0d.wav",
    text: "Chạm vào bóng râm nhé.",
  },
  [normalizeText("Bóng râm nằm ở phía trên bên phải đó.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_shade_fail_a38fbe37.wav",
    text: "Bóng râm nằm ở phía trên bên phải đó.",
  },
  [normalizeText("Bé đứng dưới bóng râm rồi!")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_shade_success_026fca18.wav",
    text: "Bé đứng dưới bóng râm rồi!",
  },
  [normalizeText("Nước ở trên bàn nhỏ đó.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_water_fail_69161104.wav",
    text: "Nước ở trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là nước.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_tap_water_success_aa6625f2.wav",
    text: "Đúng rồi, đó là nước.",
  },
  [normalizeText("Đây là ghế dài.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_bench_dd70ee6f.wav",
    text: "Đây là ghế dài.",
  },
  [normalizeText("Từ này nghĩa là ghế dài.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_bench_success_f871f3ec.wav",
    text: "Từ này nghĩa là ghế dài.",
  },
  [normalizeText("Đây là bình nước.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_bottle_9972366e.wav",
    text: "Đây là bình nước.",
  },
  [normalizeText("Từ này nghĩa là bình nước.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_bottle_success_c6da78d9.wav",
    text: "Từ này nghĩa là bình nước.",
  },
  [normalizeText("Mình học câu uống nước nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_drink_water_10f6f213.wav",
    text: "Mình học câu uống nước nhé.",
  },
  [normalizeText("Câu này nghĩa là uống nước.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_drink_water_success_f8541bb1.wav",
    text: "Câu này nghĩa là uống nước.",
  },
  [normalizeText("Mình học câu ăn nhẹ nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_eat_snack_ff77be58.wav",
    text: "Mình học câu ăn nhẹ nhé.",
  },
  [normalizeText("Câu này nghĩa là ăn nhẹ.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_eat_snack_success_9ae9ffb3.wav",
    text: "Câu này nghĩa là ăn nhẹ.",
  },
  [normalizeText("Mình học từ nghỉ ngơi nhé.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_rest_f15dc046.wav",
    text: "Mình học từ nghỉ ngơi nhé.",
  },
  [normalizeText("Từ này nghĩa là nghỉ ngơi.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_rest_success_b2b68fff.wav",
    text: "Từ này nghĩa là nghỉ ngơi.",
  },
  [normalizeText("Đây là bóng râm.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_shade_208f2722.wav",
    text: "Đây là bóng râm.",
  },
  [normalizeText("Từ này nghĩa là bóng râm.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_shade_success_419505c9.wav",
    text: "Từ này nghĩa là bóng râm.",
  },
  [normalizeText("Đây là đồ ăn nhẹ.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_snack_fee65cd6.wav",
    text: "Đây là đồ ăn nhẹ.",
  },
  [normalizeText("Từ này nghĩa là đồ ăn nhẹ.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_snack_success_2c4ca751.wav",
    text: "Từ này nghĩa là đồ ăn nhẹ.",
  },
  [normalizeText("Đây là khăn lau.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_towel_f57fd504.wav",
    text: "Đây là khăn lau.",
  },
  [normalizeText("Từ này nghĩa là khăn lau.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_towel_success_c15321eb.wav",
    text: "Từ này nghĩa là khăn lau.",
  },
  [normalizeText("Từ này nghĩa là nước.")]: {
    key: "lessons/playtime/playtime-rest/audio/vi/rest_teach_water_success_bc2ccca0.wav",
    text: "Từ này nghĩa là nước.",
  },
  [normalizeText("Bé đã dọn sau bữa xế thật sạch sẽ!")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/completion_e813bd9c.wav",
    text: "Bé đã dọn sau bữa xế thật sạch sẽ!",
  },
  [normalizeText("Dùng khăn lau để lau bàn.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_cloth_to_table_4fe6bb00.wav",
    text: "Dùng khăn lau để lau bàn.",
  },
  [normalizeText("Mặt bàn đã sạch rồi.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_cloth_to_table_success_0948270c.wav",
    text: "Mặt bàn đã sạch rồi.",
  },
  [normalizeText("Cất cái khay vào giỏ.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_tray_away_2ef397b4.wav",
    text: "Cất cái khay vào giỏ.",
  },
  [normalizeText("Kéo cái khay tới cái giỏ nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_tray_away_fail_0f52281d.wav",
    text: "Kéo cái khay tới cái giỏ nhé.",
  },
  [normalizeText("Bé đã dọn xong bữa xế rồi.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_tray_away_success_4b0fa6ff.wav",
    text: "Bé đã dọn xong bữa xế rồi.",
  },
  [normalizeText("Vỏ bánh đã được bỏ đúng chỗ.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_away_success_84c035d8.wav",
    text: "Vỏ bánh đã được bỏ đúng chỗ.",
  },
  [normalizeText("Bỏ vỏ bánh vào thùng rác.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_to_trash_c03ebeab.wav",
    text: "Bỏ vỏ bánh vào thùng rác.",
  },
  [normalizeText("Kéo vỏ bánh tới thùng rác nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_to_trash_fail_a2dc875f.wav",
    text: "Kéo vỏ bánh tới thùng rác nhé.",
  },
  [normalizeText("Vỏ bánh đã vào thùng rác.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_to_trash_success_03761806.wav",
    text: "Vỏ bánh đã vào thùng rác.",
  },
  [normalizeText("Đặt vỏ bánh lên khay để gom lại.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_to_tray_c02da8ab.wav",
    text: "Đặt vỏ bánh lên khay để gom lại.",
  },
  [normalizeText("Kéo vỏ bánh tới cái khay nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_to_tray_fail_f829d2f5.wav",
    text: "Kéo vỏ bánh tới cái khay nhé.",
  },
  [normalizeText("Vỏ bánh đã nằm trên khay.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/drag_wrapper_to_tray_success_b4e0de06.wav",
    text: "Vỏ bánh đã nằm trên khay.",
  },
  [normalizeText("Ăn xong rồi, mình dọn bữa xế nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/intro_34a95719.wav",
    text: "Ăn xong rồi, mình dọn bữa xế nhé.",
  },
  [normalizeText("Dọn sau khi ăn giúp góc ăn sạch hơn.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/intro_success_42418442.wav",
    text: "Dọn sau khi ăn giúp góc ăn sạch hơn.",
  },
  [normalizeText("Cái giỏ nằm phía sau bàn nhỏ đó.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_basket_fail_87ad490f.wav",
    text: "Cái giỏ nằm phía sau bàn nhỏ đó.",
  },
  [normalizeText("Khăn lau nằm gần vụn bánh đó.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_cloth_fail_86f9be2e.wav",
    text: "Khăn lau nằm gần vụn bánh đó.",
  },
  [normalizeText("Chạm vào vụn bánh nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_crumbs_0c36b298.wav",
    text: "Chạm vào vụn bánh nhé.",
  },
  [normalizeText("Vụn bánh ở cạnh cái khay đó.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_crumbs_fail_8ec57ed3.wav",
    text: "Vụn bánh ở cạnh cái khay đó.",
  },
  [normalizeText("Đúng rồi, đó là vụn bánh.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_crumbs_success_0ae999d9.wav",
    text: "Đúng rồi, đó là vụn bánh.",
  },
  [normalizeText("Chạm vào cái khay nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_tray_7ea89511.wav",
    text: "Chạm vào cái khay nhé.",
  },
  [normalizeText("Cái khay nằm trên bàn nhỏ đó.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_tray_fail_28a1bc77.wav",
    text: "Cái khay nằm trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là cái khay.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/tap_tray_success_27188ce0.wav",
    text: "Đúng rồi, đó là cái khay.",
  },
  [normalizeText("Đây là vụn bánh.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_crumbs_56f28a54.wav",
    text: "Đây là vụn bánh.",
  },
  [normalizeText("Từ này nghĩa là vụn bánh.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_crumbs_success_2947f184.wav",
    text: "Từ này nghĩa là vụn bánh.",
  },
  [normalizeText("Mình học câu cất khay nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_put_away_tray_2070b75b.wav",
    text: "Mình học câu cất khay nhé.",
  },
  [normalizeText("Cất khay giúp góc ăn gọn gàng.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_put_away_tray_success_e5629d8b.wav",
    text: "Cất khay giúp góc ăn gọn gàng.",
  },
  [normalizeText("Mình học câu bỏ vỏ bánh nhé.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_throw_away_wrapper_8dfa1c11.wav",
    text: "Mình học câu bỏ vỏ bánh nhé.",
  },
  [normalizeText("Vỏ bánh cần được bỏ đúng chỗ.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_throw_away_wrapper_success_6554328e.wav",
    text: "Vỏ bánh cần được bỏ đúng chỗ.",
  },
  [normalizeText("Đây là cái khay.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_tray_d65ed5a6.wav",
    text: "Đây là cái khay.",
  },
  [normalizeText("Từ này nghĩa là cái khay.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_tray_success_128568ce.wav",
    text: "Từ này nghĩa là cái khay.",
  },
  [normalizeText("Lau bàn giúp góc ăn sạch hơn.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_wipe_table_success_514fa370.wav",
    text: "Lau bàn giúp góc ăn sạch hơn.",
  },
  [normalizeText("Đây là vỏ bánh.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_wrapper_c4c8e53b.wav",
    text: "Đây là vỏ bánh.",
  },
  [normalizeText("Từ này nghĩa là vỏ bánh.")]: {
    key: "lessons/snack-time/snack-cleanup/audio/vi/teach_wrapper_success_7f120dcf.wav",
    text: "Từ này nghĩa là vỏ bánh.",
  },
  [normalizeText("Bé đã chọn bữa xế thật ngon!")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/completion_eec4573c.wav",
    text: "Bé đã chọn bữa xế thật ngon!",
  },
  [normalizeText("Đặt bánh quy cạnh món bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_cookie_to_snack_dfd6020e.wav",
    text: "Đặt bánh quy cạnh món bữa xế.",
  },
  [normalizeText("Kéo bánh quy tới món bữa xế nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_cookie_to_snack_fail_871ce943.wav",
    text: "Kéo bánh quy tới món bữa xế nhé.",
  },
  [normalizeText("Bánh quy đã được chọn cho bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_cookie_to_snack_success_8c4a58d9.wav",
    text: "Bánh quy đã được chọn cho bữa xế.",
  },
  [normalizeText("Rót nước ép vào ly nhỏ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_juice_to_container_31b4e0ab.wav",
    text: "Rót nước ép vào ly nhỏ.",
  },
  [normalizeText("Kéo hộp nước ép tới ly nhỏ nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_juice_to_container_fail_fef6128b.wav",
    text: "Kéo hộp nước ép tới ly nhỏ nhé.",
  },
  [normalizeText("Ly nước ép đã sẵn sàng.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_juice_to_container_success_e4b6b379.wav",
    text: "Ly nước ép đã sẵn sàng.",
  },
  [normalizeText("Cắm ống hút vào hộp nước ép.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_straw_to_juice_d0a09aa0.wav",
    text: "Cắm ống hút vào hộp nước ép.",
  },
  [normalizeText("Kéo ống hút tới hộp nước ép nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_straw_to_juice_fail_8b1f6f7d.wav",
    text: "Kéo ống hút tới hộp nước ép nhé.",
  },
  [normalizeText("Ống hút đã nằm đúng chỗ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/drag_straw_to_juice_success_2f8a88a8.wav",
    text: "Ống hút đã nằm đúng chỗ.",
  },
  [normalizeText("Mình chọn món bữa xế nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/intro_c5b540e4.wav",
    text: "Mình chọn món bữa xế nhé.",
  },
  [normalizeText("Bữa xế là một món nhẹ sau khi bé về nhà.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/intro_success_c1b55d9c.wav",
    text: "Bữa xế là một món nhẹ sau khi bé về nhà.",
  },
  [normalizeText("Mở hộp đồ ăn nhẹ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_box_open_ee19d02e.wav",
    text: "Mở hộp đồ ăn nhẹ.",
  },
  [normalizeText("Chạm vào hộp đồ ăn nhẹ để mở nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_box_open_fail_353c1ff7.wav",
    text: "Chạm vào hộp đồ ăn nhẹ để mở nhé.",
  },
  [normalizeText("Hộp đồ ăn nhẹ đã mở rồi.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_box_open_success_4ccde680.wav",
    text: "Hộp đồ ăn nhẹ đã mở rồi.",
  },
  [normalizeText("Chọn một món cho bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_choice_8baf5230.wav",
    text: "Chọn một món cho bữa xế.",
  },
  [normalizeText("Chọn một món nhẹ trên bàn nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_choice_fail_3f095ae1.wav",
    text: "Chọn một món nhẹ trên bàn nhé.",
  },
  [normalizeText("Bé đã chọn được món bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_choice_success_4edc855a.wav",
    text: "Bé đã chọn được món bữa xế.",
  },
  [normalizeText("Chạm vào nước ép nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_juice_9b137617.wav",
    text: "Chạm vào nước ép nhé.",
  },
  [normalizeText("Hộp nước ép nằm bên trái đó.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_juice_fail_857e74b9.wav",
    text: "Hộp nước ép nằm bên trái đó.",
  },
  [normalizeText("Đúng rồi, đó là nước ép.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_juice_success_ae7b7561.wav",
    text: "Đúng rồi, đó là nước ép.",
  },
  [normalizeText("Chạm vào bữa xế nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_snack_03bda5b5.wav",
    text: "Chạm vào bữa xế nhé.",
  },
  [normalizeText("Chạm vào hộp đồ ăn nhẹ nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_snack_box_1870343e.wav",
    text: "Chạm vào hộp đồ ăn nhẹ nhé.",
  },
  [normalizeText("Hộp đồ ăn nhẹ nằm phía sau món bữa xế đó.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_snack_box_fail_f3274ad2.wav",
    text: "Hộp đồ ăn nhẹ nằm phía sau món bữa xế đó.",
  },
  [normalizeText("Đúng rồi, đó là hộp đồ ăn nhẹ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_snack_box_success_4420e955.wav",
    text: "Đúng rồi, đó là hộp đồ ăn nhẹ.",
  },
  [normalizeText("Món bữa xế nằm trên bàn nhỏ đó.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_snack_fail_fc07d0ea.wav",
    text: "Món bữa xế nằm trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_snack_success_01d45de1.wav",
    text: "Đúng rồi, đó là bữa xế.",
  },
  [normalizeText("Chạm vào sữa chua nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_yogurt_7ef00497.wav",
    text: "Chạm vào sữa chua nhé.",
  },
  [normalizeText("Hũ sữa chua ở cạnh món bữa xế đó.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_yogurt_fail_5cb4d998.wav",
    text: "Hũ sữa chua ở cạnh món bữa xế đó.",
  },
  [normalizeText("Đúng rồi, đó là sữa chua.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/tap_yogurt_success_ccb0783a.wav",
    text: "Đúng rồi, đó là sữa chua.",
  },
  [normalizeText("Mình học câu chọn bữa xế nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_choose_snack_c253a99e.wav",
    text: "Mình học câu chọn bữa xế nhé.",
  },
  [normalizeText("Bé có thể chọn một món nhẹ mình thích.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_choose_snack_success_71b043a2.wav",
    text: "Bé có thể chọn một món nhẹ mình thích.",
  },
  [normalizeText("Đây là bánh quy.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_cookie_0d517b28.wav",
    text: "Đây là bánh quy.",
  },
  [normalizeText("Từ này nghĩa là bánh quy.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_cookie_success_a6936812.wav",
    text: "Từ này nghĩa là bánh quy.",
  },
  [normalizeText("Đây là nước ép.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_juice_1e8a4724.wav",
    text: "Đây là nước ép.",
  },
  [normalizeText("Từ này nghĩa là nước ép.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_juice_success_466fa769.wav",
    text: "Từ này nghĩa là nước ép.",
  },
  [normalizeText("Mình học câu mở hộp đồ ăn nhẹ nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_open_snack_box_16a0e7cf.wav",
    text: "Mình học câu mở hộp đồ ăn nhẹ nhé.",
  },
  [normalizeText("Mở hộp ra rồi bé mới lấy món ăn nhẹ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_open_snack_box_success_8193f067.wav",
    text: "Mở hộp ra rồi bé mới lấy món ăn nhẹ.",
  },
  [normalizeText("Mình học câu rót nước ép nhé.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_pour_juice_dc720754.wav",
    text: "Mình học câu rót nước ép nhé.",
  },
  [normalizeText("Rót nước ép ra ly nhỏ để uống gọn hơn.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_pour_juice_success_f6bf9e6b.wav",
    text: "Rót nước ép ra ly nhỏ để uống gọn hơn.",
  },
  [normalizeText("Đây là hộp đồ ăn nhẹ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_snack_box_47af8e89.wav",
    text: "Đây là hộp đồ ăn nhẹ.",
  },
  [normalizeText("Từ này nghĩa là hộp đồ ăn nhẹ.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_snack_box_success_86a08761.wav",
    text: "Từ này nghĩa là hộp đồ ăn nhẹ.",
  },
  [normalizeText("Đây là bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_snack_ebc9df89.wav",
    text: "Đây là bữa xế.",
  },
  [normalizeText("Từ này nghĩa là bữa xế.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_snack_success_50b2560f.wav",
    text: "Từ này nghĩa là bữa xế.",
  },
  [normalizeText("Đây là ống hút.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_straw_6ba2dda1.wav",
    text: "Đây là ống hút.",
  },
  [normalizeText("Từ này nghĩa là ống hút.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_straw_success_21f98b13.wav",
    text: "Từ này nghĩa là ống hút.",
  },
  [normalizeText("Đây là sữa chua.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_yogurt_1be5aee7.wav",
    text: "Đây là sữa chua.",
  },
  [normalizeText("Từ này nghĩa là sữa chua.")]: {
    key: "lessons/snack-time/snack-prep/audio/vi/teach_yogurt_success_cbeeb251.wav",
    text: "Từ này nghĩa là sữa chua.",
  },
  [normalizeText("Bé đã ăn bữa xế thật gọn gàng!")]: {
    key: "lessons/snack-time/snack-table/audio/vi/completion_56e282b6.wav",
    text: "Bé đã ăn bữa xế thật gọn gàng!",
  },
  [normalizeText("Đưa bánh giòn tới miệng để cắn một miếng.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_cracker_to_mouth_87df6202.wav",
    text: "Đưa bánh giòn tới miệng để cắn một miếng.",
  },
  [normalizeText("Kéo bánh giòn tới miệng bé nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_cracker_to_mouth_fail_cd215dc1.wav",
    text: "Kéo bánh giòn tới miệng bé nhé.",
  },
  [normalizeText("Bé đã cắn một miếng bánh nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_cracker_to_mouth_success_121816cd.wav",
    text: "Bé đã cắn một miếng bánh nhỏ.",
  },
  [normalizeText("Đặt bánh giòn lên bàn nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_cracker_to_table_51f1c547.wav",
    text: "Đặt bánh giòn lên bàn nhỏ.",
  },
  [normalizeText("Kéo bánh giòn tới bàn nhỏ nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_cracker_to_table_fail_3143b469.wav",
    text: "Kéo bánh giòn tới bàn nhỏ nhé.",
  },
  [normalizeText("Bánh giòn đã nằm trên bàn nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_cracker_to_table_success_eaf2ae74.wav",
    text: "Bánh giòn đã nằm trên bàn nhỏ.",
  },
  [normalizeText("Dùng khăn giấy lau miệng.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_napkin_to_mouth_d9d5ee10.wav",
    text: "Dùng khăn giấy lau miệng.",
  },
  [normalizeText("Kéo khăn giấy tới miệng bé nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_napkin_to_mouth_fail_a7fc1d13.wav",
    text: "Kéo khăn giấy tới miệng bé nhé.",
  },
  [normalizeText("Miệng của bé đã sạch rồi.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_napkin_to_mouth_success_99ac49c0.wav",
    text: "Miệng của bé đã sạch rồi.",
  },
  [normalizeText("Đưa ly nước ép tới miệng để nhấp một ngụm.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_sip_to_mouth_78e2256a.wav",
    text: "Đưa ly nước ép tới miệng để nhấp một ngụm.",
  },
  [normalizeText("Kéo ly nước ép tới miệng bé nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_sip_to_mouth_fail_19b2f8dc.wav",
    text: "Kéo ly nước ép tới miệng bé nhé.",
  },
  [normalizeText("Bé đã nhấp một ngụm nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/drag_sip_to_mouth_success_67b3155d.wav",
    text: "Bé đã nhấp một ngụm nhỏ.",
  },
  [normalizeText("Mình ăn bữa xế từng miếng nhỏ nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/intro_3df2da26.wav",
    text: "Mình ăn bữa xế từng miếng nhỏ nhé.",
  },
  [normalizeText("Ăn từng miếng nhỏ giúp bé ăn gọn hơn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/intro_success_f461403d.wav",
    text: "Ăn từng miếng nhỏ giúp bé ăn gọn hơn.",
  },
  [normalizeText("Chạm vào miếng cắn nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_bite_ef5fc7b6.wav",
    text: "Chạm vào miếng cắn nhé.",
  },
  [normalizeText("Miếng cắn nằm trên bàn nhỏ đó.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_bite_fail_3543c752.wav",
    text: "Miếng cắn nằm trên bàn nhỏ đó.",
  },
  [normalizeText("Đúng rồi, đó là một miếng cắn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_bite_success_ddced4ed.wav",
    text: "Đúng rồi, đó là một miếng cắn.",
  },
  [normalizeText("Chạm vào bánh giòn nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_cracker_e72837ba.wav",
    text: "Chạm vào bánh giòn nhé.",
  },
  [normalizeText("Bánh giòn nằm cạnh hộp nho khô đó.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_cracker_fail_cc666fff.wav",
    text: "Bánh giòn nằm cạnh hộp nho khô đó.",
  },
  [normalizeText("Đúng rồi, đó là bánh giòn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_cracker_success_01305eea.wav",
    text: "Đúng rồi, đó là bánh giòn.",
  },
  [normalizeText("Chạm vào khăn giấy nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_napkin_76b95604.wav",
    text: "Chạm vào khăn giấy nhé.",
  },
  [normalizeText("Khăn giấy nằm gần mép bàn đó.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_napkin_fail_27814cf5.wav",
    text: "Khăn giấy nằm gần mép bàn đó.",
  },
  [normalizeText("Đúng rồi, đó là khăn giấy.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_napkin_success_cd5d7cf0.wav",
    text: "Đúng rồi, đó là khăn giấy.",
  },
  [normalizeText("Chạm vào nho khô nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_raisins_fafa56e0.wav",
    text: "Chạm vào nho khô nhé.",
  },
  [normalizeText("Nho khô nằm cạnh bánh giòn đó.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_raisins_fail_b187546a.wav",
    text: "Nho khô nằm cạnh bánh giòn đó.",
  },
  [normalizeText("Đúng rồi, đó là nho khô.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_raisins_success_085e0429.wav",
    text: "Đúng rồi, đó là nho khô.",
  },
  [normalizeText("Chạm vào ngụm nhỏ nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_sip_568e76ad.wav",
    text: "Chạm vào ngụm nhỏ nhé.",
  },
  [normalizeText("Ngụm nhỏ nằm trong ly có ống hút đó.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_sip_fail_8329757b.wav",
    text: "Ngụm nhỏ nằm trong ly có ống hút đó.",
  },
  [normalizeText("Đúng rồi, đó là một ngụm nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/tap_sip_success_c4a4424b.wav",
    text: "Đúng rồi, đó là một ngụm nhỏ.",
  },
  [normalizeText("Đây là một miếng cắn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_bite_7aacb2f1.wav",
    text: "Đây là một miếng cắn.",
  },
  [normalizeText("Từ này nghĩa là miếng cắn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_bite_success_6ba7d235.wav",
    text: "Từ này nghĩa là miếng cắn.",
  },
  [normalizeText("Đây là bánh giòn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_cracker_8bf3ae7f.wav",
    text: "Đây là bánh giòn.",
  },
  [normalizeText("Từ này nghĩa là bánh giòn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_cracker_success_42bddf36.wav",
    text: "Từ này nghĩa là bánh giòn.",
  },
  [normalizeText("Đây là nho khô.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_raisins_f19ce40d.wav",
    text: "Đây là nho khô.",
  },
  [normalizeText("Từ này nghĩa là nho khô.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_raisins_success_4e64efff.wav",
    text: "Từ này nghĩa là nho khô.",
  },
  [normalizeText("Đây là một ngụm nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_sip_9d4beeb4.wav",
    text: "Đây là một ngụm nhỏ.",
  },
  [normalizeText("Mình học câu nhấp nước ép nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_sip_juice_31fe4650.wav",
    text: "Mình học câu nhấp nước ép nhé.",
  },
  [normalizeText("Nhấp từng ngụm nhỏ giúp bé uống gọn hơn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_sip_juice_success_d0243e72.wav",
    text: "Nhấp từng ngụm nhỏ giúp bé uống gọn hơn.",
  },
  [normalizeText("Từ này nghĩa là ngụm nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_sip_success_0417e71f.wav",
    text: "Từ này nghĩa là ngụm nhỏ.",
  },
  [normalizeText("Đây là bàn nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_small_table_f7f76d2e.wav",
    text: "Đây là bàn nhỏ.",
  },
  [normalizeText("Từ này nghĩa là bàn nhỏ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_small_table_success_afaf9214.wav",
    text: "Từ này nghĩa là bàn nhỏ.",
  },
  [normalizeText("Mình học câu cắn một miếng nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_take_bite_06a851f0.wav",
    text: "Mình học câu cắn một miếng nhé.",
  },
  [normalizeText("Cắn từng miếng nhỏ giúp bé ăn gọn hơn.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_take_bite_success_4de8671b.wav",
    text: "Cắn từng miếng nhỏ giúp bé ăn gọn hơn.",
  },
  [normalizeText("Mình học câu lau miệng nhé.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_wipe_mouth_2bf3241b.wav",
    text: "Mình học câu lau miệng nhé.",
  },
  [normalizeText("Lau miệng sau khi ăn giúp bé sạch sẽ.")]: {
    key: "lessons/snack-time/snack-table/audio/vi/teach_wipe_mouth_success_071eff48.wav",
    text: "Lau miệng sau khi ăn giúp bé sạch sẽ.",
  },
  [normalizeText("Đúng rồi! Bé giỏi quá!")]: {
    key: "shared/audio/vi/correct.wav",
    text: "Đúng rồi! Bé giỏi quá!",
  },
  [normalizeText("Con hãy tìm hai hình giống nhau nhé.")]: {
    key: "shared/audio/vi/memory_game_intro.wav",
    text: "Con hãy tìm hai hình giống nhau nhé.",
  },
  [normalizeText("Cô nghe rồi! Giỏi quá!")]: {
    key: "shared/audio/vi/speak_encourage.wav",
    text: "Cô nghe rồi! Giỏi quá!",
  },
  [normalizeText("Bé nói theo cô nhé.")]: {
    key: "shared/audio/vi/speak_prompt.wav",
    text: "Bé nói theo cô nhé.",
  },
  [normalizeText("Ba mẹ chọn độ khó trước, rồi Sungy sẽ dẫn bé đi từng trạm nhé.")]: {
    key: "shared/audio/vi/sungy/ba_me_chon_o_kho_truoc_roi_sungy_se_dan_be_i_tung_tram_nhe_823e71e6.wav",
    text: "Ba mẹ chọn độ khó trước, rồi Sungy sẽ dẫn bé đi từng trạm nhé.",
  },
  [normalizeText("Bấm tab Chơi để gặp game đang mở nhé.")]: {
    key: "shared/audio/vi/sungy/bam_tab_choi_e_gap_game_ang_mo_nhe_cbd5f365.wav",
    text: "Bấm tab Chơi để gặp game đang mở nhé.",
  },
  [normalizeText("Bấm vào trạm sáng lên để học tiếp nhé.")]: {
    key: "shared/audio/vi/sungy/bam_vao_tram_sang_len_e_hoc_tiep_nhe_168f2d20.wav",
    text: "Bấm vào trạm sáng lên để học tiếp nhé.",
  },
  [normalizeText("Bấm vào từ mới bên dưới để nghe lại tiếng Anh nhé.")]: {
    key: "shared/audio/vi/sungy/bam_vao_tu_moi_ben_duoi_e_nghe_lai_tieng_anh_nhe_cb489611.wav",
    text: "Bấm vào từ mới bên dưới để nghe lại tiếng Anh nhé.",
  },
  [normalizeText("Bé đã đi rất xa rồi, Sungy tự hào lắm!")]: {
    key: "shared/audio/vi/sungy/be_a_i_rat_xa_roi_sungy_tu_hao_lam_66b32e83.wav",
    text: "Bé đã đi rất xa rồi, Sungy tự hào lắm!",
  },
  [normalizeText("Bé giỏi quá! Mình cùng nhận thêm sticker nhé.")]: {
    key: "shared/audio/vi/sungy/be_gioi_qua_minh_cung_nhan_them_sticker_nhe_1b33832a.wav",
    text: "Bé giỏi quá! Mình cùng nhận thêm sticker nhé.",
  },
  [normalizeText("Bé vừa hoàn thành cảnh này rồi!")]: {
    key: "shared/audio/vi/sungy/be_vua_hoan_thanh_canh_nay_roi_7f4ccfc9.wav",
    text: "Bé vừa hoàn thành cảnh này rồi!",
  },
  [normalizeText("Cảnh tiếp theo đang chờ mình. Mình đi nhé!")]: {
    key: "shared/audio/vi/sungy/canh_tiep_theo_ang_cho_minh_minh_i_nhe_1c48cf95.wav",
    text: "Cảnh tiếp theo đang chờ mình. Mình đi nhé!",
  },
  [normalizeText("Chạm nút màu vàng để tiếp tục nào!")]: {
    key: "shared/audio/vi/sungy/cham_nut_mau_vang_e_tiep_tuc_nao_7a70ebdb.wav",
    text: "Chạm nút màu vàng để tiếp tục nào!",
  },
  [normalizeText("Chơi ôn tập xong là Sungy trao sticker liền!")]: {
    key: "shared/audio/vi/sungy/choi_on_tap_xong_la_sungy_trao_sticker_lien_2f262b0f.wav",
    text: "Chơi ôn tập xong là Sungy trao sticker liền!",
  },
  [normalizeText("Mình có thể chơi lại để ôn từ mới nữa đó.")]: {
    key: "shared/audio/vi/sungy/minh_co_the_choi_lai_e_on_tu_moi_nua_o_3f2eeef4.wav",
    text: "Mình có thể chơi lại để ôn từ mới nữa đó.",
  },
  [normalizeText("Mình cùng lật thẻ để nhớ từ lâu hơn nhé.")]: {
    key: "shared/audio/vi/sungy/minh_cung_lat_the_e_nho_tu_lau_hon_nhe_756c712b.wav",
    text: "Mình cùng lật thẻ để nhớ từ lâu hơn nhé.",
  },
  [normalizeText("Mình kiếm thêm sao nào!")]: {
    key: "shared/audio/vi/sungy/minh_kiem_them_sao_nao_018ee72c.wav",
    text: "Mình kiếm thêm sao nào!",
  },
  [normalizeText("Mình sẵn sàng sang bài tiếp theo.")]: {
    key: "shared/audio/vi/sungy/minh_san_sang_sang_bai_tiep_theo_98f72c3d.wav",
    text: "Mình sẵn sàng sang bài tiếp theo.",
  },
  [normalizeText("Mình sẽ cổ vũ bé mỗi khi bé học xong một cảnh.")]: {
    key: "shared/audio/vi/sungy/minh_se_co_vu_be_moi_khi_be_hoc_xong_mot_canh_da5c3792.wav",
    text: "Mình sẽ cổ vũ bé mỗi khi bé học xong một cảnh.",
  },
  [normalizeText("Sticker mới sáng lên rồi!")]: {
    key: "shared/audio/vi/sungy/sticker_moi_sang_len_roi_08c5f47f.wav",
    text: "Sticker mới sáng lên rồi!",
  },
  [normalizeText("Sungy đã thấy cả bản đồ sáng lên rồi!")]: {
    key: "shared/audio/vi/sungy/sungy_a_thay_ca_ban_o_sang_len_roi_9429c5c4.wav",
    text: "Sungy đã thấy cả bản đồ sáng lên rồi!",
  },
  [normalizeText("Sungy đang giữ sticker mới cho bé đây.")]: {
    key: "shared/audio/vi/sungy/sungy_ang_giu_sticker_moi_cho_be_ay_535e2848.wav",
    text: "Sungy đang giữ sticker mới cho bé đây.",
  },
  [normalizeText("Sungy đi cùng bé nè!")]: {
    key: "shared/audio/vi/sungy/sungy_i_cung_be_ne_26b29757.wav",
    text: "Sungy đi cùng bé nè!",
  },
  [normalizeText("Xin chào! Mình là Sungy, bạn học của bé.")]: {
    key: "shared/audio/vi/sungy/xin_chao_minh_la_sungy_ban_hoc_cua_be_967fe8c4.wav",
    text: "Xin chào! Mình là Sungy, bạn học của bé.",
  },
};

export function getWordAudioAssets(
  word: string,
  accent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,
) {
  const assets = enAudioByText[normalizeText(word)];
  const candidates: Array<RemoteAudioAsset | undefined> = [
    assets?.[accent],
    assets?.[DEFAULT_ENGLISH_ACCENT],
    assets?.legacy,
  ];
  const seenKeys = new Set<string>();
  return candidates.filter((asset): asset is RemoteAudioAsset => {
    if (!asset || seenKeys.has(asset.key)) {
      return false;
    }
    seenKeys.add(asset.key);
    return true;
  });
}

export function getWordAudioAsset(
  word: string,
  accent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,
) {
  return getWordAudioAssets(word, accent)[0];
}

export function getViAudioAsset(text: string) {
  return viAudioByText[normalizeText(text)];
}

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}
