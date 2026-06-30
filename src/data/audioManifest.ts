export type RemoteAudioAsset = {
  key: string;
  text: string;
};

const wordAudioByWord: Record<string, RemoteAudioAsset> = {
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
};

const viAudioByText: Record<string, RemoteAudioAsset> = {
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
