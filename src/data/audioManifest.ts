export type RemoteAudioAsset = {
  key: string;
  text: string;
};

const wordAudioByWord: Record<string, RemoteAudioAsset> = {
  [normalizeText("door")]: {
    key: "lessons/afternoon-home/going-home/audio/en/door.wav",
    text: "door",
  },
  [normalizeText("folder")]: {
    key: "lessons/afternoon-home/going-home/audio/en/folder.wav",
    text: "folder",
  },
  [normalizeText("jacket")]: {
    key: "lessons/afternoon-home/going-home/audio/en/jacket.wav",
    text: "jacket",
  },
  [normalizeText("line up")]: {
    key: "lessons/afternoon-home/going-home/audio/en/line_up.wav",
    text: "line up",
  },
  [normalizeText("say goodbye")]: {
    key: "lessons/afternoon-home/going-home/audio/en/say_goodbye.wav",
    text: "say goodbye",
  },
  [normalizeText("family")]: {
    key: "lessons/afternoon-home/home-arrival/audio/en/family.wav",
    text: "family",
  },
  [normalizeText("hug family")]: {
    key: "lessons/afternoon-home/home-arrival/audio/en/hug_family.wav",
    text: "hug family",
  },
  [normalizeText("shelf")]: {
    key: "lessons/afternoon-home/home-arrival/audio/en/shelf.wav",
    text: "shelf",
  },
  [normalizeText("take off shoes")]: {
    key: "lessons/afternoon-home/home-arrival/audio/en/take_off_shoes.wav",
    text: "take off shoes",
  },
  [normalizeText("arrive home")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/arrive_home.wav",
    text: "arrive home",
  },
  [normalizeText("buckle up")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/buckle_up.wav",
    text: "buckle up",
  },
  [normalizeText("get on bus")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/get_on_bus.wav",
    text: "get on bus",
  },
  [normalizeText("home")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/home.wav",
    text: "home",
  },
  [normalizeText("road")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/road.wav",
    text: "road",
  },
  [normalizeText("seat belt")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/seat_belt.wav",
    text: "seat belt",
  },
  [normalizeText("traffic light")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/traffic_light.wav",
    text: "traffic light",
  },
  [normalizeText("window")]: {
    key: "lessons/afternoon-home/ride-home/audio/en/window.wav",
    text: "window",
  },
  [normalizeText("board")]: {
    key: "lessons/at-school/classroom/audio/en/board.wav",
    text: "board",
  },
  [normalizeText("chair")]: {
    key: "lessons/at-school/classroom/audio/en/chair.wav",
    text: "chair",
  },
  [normalizeText("classroom")]: {
    key: "lessons/at-school/classroom/audio/en/classroom.wav",
    text: "classroom",
  },
  [normalizeText("desk")]: {
    key: "lessons/at-school/classroom/audio/en/desk.wav",
    text: "desk",
  },
  [normalizeText("raise hand")]: {
    key: "lessons/at-school/classroom/audio/en/raise_hand.wav",
    text: "raise hand",
  },
  [normalizeText("sit down")]: {
    key: "lessons/at-school/classroom/audio/en/sit_down.wav",
    text: "sit down",
  },
  [normalizeText("teacher")]: {
    key: "lessons/at-school/classroom/audio/en/teacher.wav",
    text: "teacher",
  },
  [normalizeText("crayon")]: {
    key: "lessons/at-school/school-supplies/audio/en/crayon.wav",
    text: "crayon",
  },
  [normalizeText("draw a circle")]: {
    key: "lessons/at-school/school-supplies/audio/en/draw_a_circle.wav",
    text: "draw a circle",
  },
  [normalizeText("eraser")]: {
    key: "lessons/at-school/school-supplies/audio/en/eraser.wav",
    text: "eraser",
  },
  [normalizeText("notebook")]: {
    key: "lessons/at-school/school-supplies/audio/en/notebook.wav",
    text: "notebook",
  },
  [normalizeText("open book")]: {
    key: "lessons/at-school/school-supplies/audio/en/open_book.wav",
    text: "open book",
  },
  [normalizeText("pencil")]: {
    key: "lessons/at-school/school-supplies/audio/en/pencil.wav",
    text: "pencil",
  },
  [normalizeText("ruler")]: {
    key: "lessons/at-school/school-supplies/audio/en/ruler.wav",
    text: "ruler",
  },
  [normalizeText("write your name")]: {
    key: "lessons/at-school/school-supplies/audio/en/write_your_name.wav",
    text: "write your name",
  },
  [normalizeText("clean up")]: {
    key: "lessons/at-school/teacher-instructions/audio/en/clean_up.wav",
    text: "clean up",
  },
  [normalizeText("listen")]: {
    key: "lessons/at-school/teacher-instructions/audio/en/listen.wav",
    text: "listen",
  },
  [normalizeText("draw picture")]: {
    key: "lessons/home-play/creative-play/audio/en/draw_picture.wav",
    text: "draw picture",
  },
  [normalizeText("drum")]: {
    key: "lessons/home-play/creative-play/audio/en/drum.wav",
    text: "drum",
  },
  [normalizeText("music")]: {
    key: "lessons/home-play/creative-play/audio/en/music.wav",
    text: "music",
  },
  [normalizeText("paper")]: {
    key: "lessons/home-play/creative-play/audio/en/paper.wav",
    text: "paper",
  },
  [normalizeText("puzzle")]: {
    key: "lessons/home-play/creative-play/audio/en/puzzle.wav",
    text: "puzzle",
  },
  [normalizeText("read book")]: {
    key: "lessons/home-play/creative-play/audio/en/read_book.wav",
    text: "read book",
  },
  [normalizeText("solve puzzle")]: {
    key: "lessons/home-play/creative-play/audio/en/solve_puzzle.wav",
    text: "solve puzzle",
  },
  [normalizeText("build tower")]: {
    key: "lessons/home-play/home-toy-corner/audio/en/build_tower.wav",
    text: "build tower",
  },
  [normalizeText("car")]: {
    key: "lessons/home-play/home-toy-corner/audio/en/car.wav",
    text: "car",
  },
  [normalizeText("choose toy")]: {
    key: "lessons/home-play/home-toy-corner/audio/en/choose_toy.wav",
    text: "choose toy",
  },
  [normalizeText("play gently")]: {
    key: "lessons/home-play/home-toy-corner/audio/en/play_gently.wav",
    text: "play gently",
  },
  [normalizeText("basket")]: {
    key: "lessons/home-play/toy-cleanup/audio/en/basket.wav",
    text: "basket",
  },
  [normalizeText("clean up toys")]: {
    key: "lessons/home-play/toy-cleanup/audio/en/clean_up_toys.wav",
    text: "clean up toys",
  },
  [normalizeText("floor")]: {
    key: "lessons/home-play/toy-cleanup/audio/en/floor.wav",
    text: "floor",
  },
  [normalizeText("put away book")]: {
    key: "lessons/home-play/toy-cleanup/audio/en/put_away_book.wav",
    text: "put away book",
  },
  [normalizeText("tidy room")]: {
    key: "lessons/home-play/toy-cleanup/audio/en/tidy_room.wav",
    text: "tidy room",
  },
  [normalizeText("crumbs")]: {
    key: "lessons/lunch-time/after-lunch/audio/en/crumbs.wav",
    text: "crumbs",
  },
  [normalizeText("trash bin")]: {
    key: "lessons/lunch-time/after-lunch/audio/en/trash_bin.wav",
    text: "trash bin",
  },
  [normalizeText("wash hands")]: {
    key: "lessons/lunch-time/after-lunch/audio/en/wash_hands.wav",
    text: "wash hands",
  },
  [normalizeText("wipe table")]: {
    key: "lessons/lunch-time/after-lunch/audio/en/wipe_table.wav",
    text: "wipe table",
  },
  [normalizeText("bowl")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/bowl.wav",
    text: "bowl",
  },
  [normalizeText("eat lunch")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/eat_lunch.wav",
    text: "eat lunch",
  },
  [normalizeText("fork")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/fork.wav",
    text: "fork",
  },
  [normalizeText("open lunchbox")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/open_lunchbox.wav",
    text: "open lunchbox",
  },
  [normalizeText("rice")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/rice.wav",
    text: "rice",
  },
  [normalizeText("soup")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/soup.wav",
    text: "soup",
  },
  [normalizeText("spoon")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/spoon.wav",
    text: "spoon",
  },
  [normalizeText("use spoon")]: {
    key: "lessons/lunch-time/lunch-box/audio/en/use_spoon.wav",
    text: "use spoon",
  },
  [normalizeText("fruit")]: {
    key: "lessons/lunch-time/lunch-table/audio/en/fruit.wav",
    text: "fruit",
  },
  [normalizeText("napkin")]: {
    key: "lessons/lunch-time/lunch-table/audio/en/napkin.wav",
    text: "napkin",
  },
  [normalizeText("say thank you")]: {
    key: "lessons/lunch-time/lunch-table/audio/en/say_thank_you.wav",
    text: "say thank you",
  },
  [normalizeText("share food")]: {
    key: "lessons/lunch-time/lunch-table/audio/en/share_food.wav",
    text: "share food",
  },
  [normalizeText("sit at table")]: {
    key: "lessons/lunch-time/lunch-table/audio/en/sit_at_table.wav",
    text: "sit at table",
  },
  [normalizeText("table")]: {
    key: "lessons/lunch-time/lunch-table/audio/en/table.wav",
    text: "table",
  },
  [normalizeText("brush teeth")]: {
    key: "lessons/morning-routine/bathroom/audio/en/brush_teeth.wav",
    text: "brush teeth",
  },
  [normalizeText("dry face")]: {
    key: "lessons/morning-routine/bathroom/audio/en/dry_face.wav",
    text: "dry face",
  },
  [normalizeText("mirror")]: {
    key: "lessons/morning-routine/bathroom/audio/en/mirror.wav",
    text: "mirror",
  },
  [normalizeText("sink")]: {
    key: "lessons/morning-routine/bathroom/audio/en/sink.wav",
    text: "sink",
  },
  [normalizeText("soap")]: {
    key: "lessons/morning-routine/bathroom/audio/en/soap.wav",
    text: "soap",
  },
  [normalizeText("toothbrush")]: {
    key: "lessons/morning-routine/bathroom/audio/en/toothbrush.wav",
    text: "toothbrush",
  },
  [normalizeText("toothpaste")]: {
    key: "lessons/morning-routine/bathroom/audio/en/toothpaste.wav",
    text: "toothpaste",
  },
  [normalizeText("towel")]: {
    key: "lessons/morning-routine/bathroom/audio/en/towel.wav",
    text: "towel",
  },
  [normalizeText("wash face")]: {
    key: "lessons/morning-routine/bathroom/audio/en/wash_face.wav",
    text: "wash face",
  },
  [normalizeText("water")]: {
    key: "lessons/morning-routine/bathroom/audio/en/water.wav",
    text: "water",
  },
  [normalizeText("bed")]: {
    key: "lessons/morning-routine/bedroom/audio/en/bed.wav",
    text: "bed",
  },
  [normalizeText("blanket")]: {
    key: "lessons/morning-routine/bedroom/audio/en/blanket.wav",
    text: "blanket",
  },
  [normalizeText("box")]: {
    key: "lessons/morning-routine/bedroom/audio/en/box.wav",
    text: "box",
  },
  [normalizeText("clock")]: {
    key: "lessons/morning-routine/bedroom/audio/en/clock.wav",
    text: "clock",
  },
  [normalizeText("doll")]: {
    key: "lessons/morning-routine/bedroom/audio/en/doll.wav",
    text: "doll",
  },
  [normalizeText("good morning")]: {
    key: "lessons/morning-routine/bedroom/audio/en/good_morning.wav",
    text: "good morning",
  },
  [normalizeText("lamp")]: {
    key: "lessons/morning-routine/bedroom/audio/en/lamp.wav",
    text: "lamp",
  },
  [normalizeText("make the bed")]: {
    key: "lessons/morning-routine/bedroom/audio/en/make_the_bed.wav",
    text: "make the bed",
  },
  [normalizeText("pillow")]: {
    key: "lessons/morning-routine/bedroom/audio/en/pillow.wav",
    text: "pillow",
  },
  [normalizeText("socks")]: {
    key: "lessons/morning-routine/bedroom/audio/en/socks.wav",
    text: "socks",
  },
  [normalizeText("sun")]: {
    key: "lessons/morning-routine/bedroom/audio/en/sun.wav",
    text: "sun",
  },
  [normalizeText("apple")]: {
    key: "lessons/morning-routine/breakfast/audio/en/apple.wav",
    text: "apple",
  },
  [normalizeText("banana")]: {
    key: "lessons/morning-routine/breakfast/audio/en/banana.wav",
    text: "banana",
  },
  [normalizeText("bread")]: {
    key: "lessons/morning-routine/breakfast/audio/en/bread.wav",
    text: "bread",
  },
  [normalizeText("cup")]: {
    key: "lessons/morning-routine/breakfast/audio/en/cup.wav",
    text: "cup",
  },
  [normalizeText("eat breakfast")]: {
    key: "lessons/morning-routine/breakfast/audio/en/eat_breakfast.wav",
    text: "eat breakfast",
  },
  [normalizeText("egg")]: {
    key: "lessons/morning-routine/breakfast/audio/en/egg.wav",
    text: "egg",
  },
  [normalizeText("milk")]: {
    key: "lessons/morning-routine/breakfast/audio/en/milk.wav",
    text: "milk",
  },
  [normalizeText("plate")]: {
    key: "lessons/morning-routine/breakfast/audio/en/plate.wav",
    text: "plate",
  },
  [normalizeText("pour milk")]: {
    key: "lessons/morning-routine/breakfast/audio/en/pour_milk.wav",
    text: "pour milk",
  },
  [normalizeText("bag")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/bag.wav",
    text: "bag",
  },
  [normalizeText("book")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/book.wav",
    text: "book",
  },
  [normalizeText("bus")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/bus.wav",
    text: "bus",
  },
  [normalizeText("go to school")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/go_to_school.wav",
    text: "go to school",
  },
  [normalizeText("lunchbox")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/lunchbox.wav",
    text: "lunchbox",
  },
  [normalizeText("pack bag")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/pack_bag.wav",
    text: "pack bag",
  },
  [normalizeText("put on shoes")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/put_on_shoes.wav",
    text: "put on shoes",
  },
  [normalizeText("school")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/school.wav",
    text: "school",
  },
  [normalizeText("shoes")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/shoes.wav",
    text: "shoes",
  },
  [normalizeText("uniform")]: {
    key: "lessons/morning-routine/go-to-school/audio/en/uniform.wav",
    text: "uniform",
  },
  [normalizeText("blocks")]: {
    key: "lessons/playtime/friend-games/audio/en/blocks.wav",
    text: "blocks",
  },
  [normalizeText("bucket")]: {
    key: "lessons/playtime/friend-games/audio/en/bucket.wav",
    text: "bucket",
  },
  [normalizeText("friend")]: {
    key: "lessons/playtime/friend-games/audio/en/friend.wav",
    text: "friend",
  },
  [normalizeText("kite")]: {
    key: "lessons/playtime/friend-games/audio/en/kite.wav",
    text: "kite",
  },
  [normalizeText("play together")]: {
    key: "lessons/playtime/friend-games/audio/en/play_together.wav",
    text: "play together",
  },
  [normalizeText("rope")]: {
    key: "lessons/playtime/friend-games/audio/en/rope.wav",
    text: "rope",
  },
  [normalizeText("share toys")]: {
    key: "lessons/playtime/friend-games/audio/en/share_toys.wav",
    text: "share toys",
  },
  [normalizeText("toy")]: {
    key: "lessons/playtime/friend-games/audio/en/toy.wav",
    text: "toy",
  },
  [normalizeText("wait")]: {
    key: "lessons/playtime/friend-games/audio/en/wait.wav",
    text: "wait",
  },
  [normalizeText("ball")]: {
    key: "lessons/playtime/playground/audio/en/ball.wav",
    text: "ball",
  },
  [normalizeText("jump")]: {
    key: "lessons/playtime/playground/audio/en/jump.wav",
    text: "jump",
  },
  [normalizeText("playground")]: {
    key: "lessons/playtime/playground/audio/en/playground.wav",
    text: "playground",
  },
  [normalizeText("run")]: {
    key: "lessons/playtime/playground/audio/en/run.wav",
    text: "run",
  },
  [normalizeText("sandbox")]: {
    key: "lessons/playtime/playground/audio/en/sandbox.wav",
    text: "sandbox",
  },
  [normalizeText("seesaw")]: {
    key: "lessons/playtime/playground/audio/en/seesaw.wav",
    text: "seesaw",
  },
  [normalizeText("slide")]: {
    key: "lessons/playtime/playground/audio/en/slide.wav",
    text: "slide",
  },
  [normalizeText("swing")]: {
    key: "lessons/playtime/playground/audio/en/swing.wav",
    text: "swing",
  },
  [normalizeText("take turns")]: {
    key: "lessons/playtime/playground/audio/en/take_turns.wav",
    text: "take turns",
  },
  [normalizeText("bench")]: {
    key: "lessons/playtime/playtime-rest/audio/en/bench.wav",
    text: "bench",
  },
  [normalizeText("bottle")]: {
    key: "lessons/playtime/playtime-rest/audio/en/bottle.wav",
    text: "bottle",
  },
  [normalizeText("drink water")]: {
    key: "lessons/playtime/playtime-rest/audio/en/drink_water.wav",
    text: "drink water",
  },
  [normalizeText("eat snack")]: {
    key: "lessons/playtime/playtime-rest/audio/en/eat_snack.wav",
    text: "eat snack",
  },
  [normalizeText("rest")]: {
    key: "lessons/playtime/playtime-rest/audio/en/rest.wav",
    text: "rest",
  },
  [normalizeText("shade")]: {
    key: "lessons/playtime/playtime-rest/audio/en/shade.wav",
    text: "shade",
  },
  [normalizeText("snack")]: {
    key: "lessons/playtime/playtime-rest/audio/en/snack.wav",
    text: "snack",
  },
  [normalizeText("cloth")]: {
    key: "lessons/snack-time/snack-cleanup/audio/en/cloth.wav",
    text: "cloth",
  },
  [normalizeText("put away tray")]: {
    key: "lessons/snack-time/snack-cleanup/audio/en/put_away_tray.wav",
    text: "put away tray",
  },
  [normalizeText("throw away wrapper")]: {
    key: "lessons/snack-time/snack-cleanup/audio/en/throw_away_wrapper.wav",
    text: "throw away wrapper",
  },
  [normalizeText("tray")]: {
    key: "lessons/snack-time/snack-cleanup/audio/en/tray.wav",
    text: "tray",
  },
  [normalizeText("wrapper")]: {
    key: "lessons/snack-time/snack-cleanup/audio/en/wrapper.wav",
    text: "wrapper",
  },
  [normalizeText("choose snack")]: {
    key: "lessons/snack-time/snack-prep/audio/en/choose_snack.wav",
    text: "choose snack",
  },
  [normalizeText("cookie")]: {
    key: "lessons/snack-time/snack-prep/audio/en/cookie.wav",
    text: "cookie",
  },
  [normalizeText("juice")]: {
    key: "lessons/snack-time/snack-prep/audio/en/juice.wav",
    text: "juice",
  },
  [normalizeText("open snack box")]: {
    key: "lessons/snack-time/snack-prep/audio/en/open_snack_box.wav",
    text: "open snack box",
  },
  [normalizeText("pour juice")]: {
    key: "lessons/snack-time/snack-prep/audio/en/pour_juice.wav",
    text: "pour juice",
  },
  [normalizeText("snack box")]: {
    key: "lessons/snack-time/snack-prep/audio/en/snack_box.wav",
    text: "snack box",
  },
  [normalizeText("straw")]: {
    key: "lessons/snack-time/snack-prep/audio/en/straw.wav",
    text: "straw",
  },
  [normalizeText("yogurt")]: {
    key: "lessons/snack-time/snack-prep/audio/en/yogurt.wav",
    text: "yogurt",
  },
  [normalizeText("bite")]: {
    key: "lessons/snack-time/snack-table/audio/en/bite.wav",
    text: "bite",
  },
  [normalizeText("cracker")]: {
    key: "lessons/snack-time/snack-table/audio/en/cracker.wav",
    text: "cracker",
  },
  [normalizeText("raisins")]: {
    key: "lessons/snack-time/snack-table/audio/en/raisins.wav",
    text: "raisins",
  },
  [normalizeText("sip juice")]: {
    key: "lessons/snack-time/snack-table/audio/en/sip_juice.wav",
    text: "sip juice",
  },
  [normalizeText("sip")]: {
    key: "lessons/snack-time/snack-table/audio/en/sip.wav",
    text: "sip",
  },
  [normalizeText("small table")]: {
    key: "lessons/snack-time/snack-table/audio/en/small_table.wav",
    text: "small table",
  },
  [normalizeText("take a bite")]: {
    key: "lessons/snack-time/snack-table/audio/en/take_a_bite.wav",
    text: "take a bite",
  },
  [normalizeText("wipe mouth")]: {
    key: "lessons/snack-time/snack-table/audio/en/wipe_mouth.wav",
    text: "wipe mouth",
  },
};

const viAudioByText: Record<string, RemoteAudioAsset> = {
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
  [normalizeText("Cô nghe rồi! Giỏi quá!")]: {
    key: "shared/audio/vi/speak_encourage.wav",
    text: "Cô nghe rồi! Giỏi quá!",
  },
  [normalizeText("Bé nói theo cô nhé.")]: {
    key: "shared/audio/vi/speak_prompt.wav",
    text: "Bé nói theo cô nhé.",
  },
};

export function getWordAudioAsset(word: string) {
  return wordAudioByWord[normalizeText(word)];
}

export function getViAudioAsset(text: string) {
  return viAudioByText[normalizeText(text)];
}

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}
