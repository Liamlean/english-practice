// language: JavaScript (ESM), file: server/seed.js
// *Vocabulary bank across CEFR levels A1–C2. Auto-seeds an empty database.*
// *Run "npm run seed" (or "node server/seed.js --force") to reload the bank.*

import "dotenv/config";
import { pathToFileURL } from "node:url";
import { client, get, run, initDb } from "./db.js";

export const WORDS = [
  // ---------------------------- A1 ----------------------------
  { en: "apple", vi: "quả táo", level: "A1", category: "Đồ ăn", emoji: "🍎", ipa: "/ˈæp.əl/", example_en: "I eat an apple every day.", example_vi: "Tôi ăn một quả táo mỗi ngày." },
  { en: "banana", vi: "quả chuối", level: "A1", category: "Đồ ăn", emoji: "🍌", ipa: "/bəˈnɑː.nə/", example_en: "Monkeys love bananas.", example_vi: "Khỉ rất thích chuối." },
  { en: "water", vi: "nước", level: "A1", category: "Đồ ăn", emoji: "💧", ipa: "/ˈwɔː.tər/", example_en: "Drink more water.", example_vi: "Hãy uống nhiều nước hơn." },
  { en: "milk", vi: "sữa", level: "A1", category: "Đồ ăn", emoji: "🥛", ipa: "/mɪlk/", example_en: "The baby drinks milk.", example_vi: "Em bé uống sữa." },
  { en: "bread", vi: "bánh mì", level: "A1", category: "Đồ ăn", emoji: "🍞", ipa: "/bred/", example_en: "She buys fresh bread.", example_vi: "Cô ấy mua bánh mì tươi." },
  { en: "rice", vi: "cơm", level: "A1", category: "Đồ ăn", emoji: "🍚", ipa: "/raɪs/", example_en: "We eat rice with fish.", example_vi: "Chúng tôi ăn cơm với cá." },
  { en: "egg", vi: "quả trứng", level: "A1", category: "Đồ ăn", emoji: "🥚", ipa: "/eɡ/", example_en: "I eat two eggs.", example_vi: "Tôi ăn hai quả trứng." },
  { en: "dog", vi: "con chó", level: "A1", category: "Động vật", emoji: "🐶", ipa: "/dɒɡ/", example_en: "My dog is friendly.", example_vi: "Con chó của tôi rất thân thiện." },
  { en: "cat", vi: "con mèo", level: "A1", category: "Động vật", emoji: "🐱", ipa: "/kæt/", example_en: "The cat sleeps a lot.", example_vi: "Con mèo ngủ rất nhiều." },
  { en: "bird", vi: "con chim", level: "A1", category: "Động vật", emoji: "🐦", ipa: "/bɜːd/", example_en: "A bird sings outside.", example_vi: "Một con chim hót bên ngoài." },
  { en: "book", vi: "quyển sách", level: "A1", category: "Đồ vật", emoji: "📚", ipa: "/bʊk/", example_en: "I read a book at night.", example_vi: "Tôi đọc sách vào buổi tối." },
  { en: "pen", vi: "cây bút", level: "A1", category: "Đồ vật", emoji: "🖊️", ipa: "/pen/", example_en: "Write with a pen.", example_vi: "Viết bằng bút." },
  { en: "chair", vi: "cái ghế", level: "A1", category: "Đồ vật", emoji: "🪑", ipa: "/tʃeər/", example_en: "Sit on the chair.", example_vi: "Ngồi lên ghế." },
  { en: "sun", vi: "mặt trời", level: "A1", category: "Thiên nhiên", emoji: "☀️", ipa: "/sʌn/", example_en: "The sun is bright today.", example_vi: "Hôm nay mặt trời rất sáng." },
  { en: "moon", vi: "mặt trăng", level: "A1", category: "Thiên nhiên", emoji: "🌙", ipa: "/muːn/", example_en: "The moon is beautiful.", example_vi: "Mặt trăng thật đẹp." },
  { en: "star", vi: "ngôi sao", level: "A1", category: "Thiên nhiên", emoji: "⭐", ipa: "/stɑːr/", example_en: "I see a star in the sky.", example_vi: "Tôi thấy một ngôi sao trên trời." },
  { en: "tree", vi: "cái cây", level: "A1", category: "Thiên nhiên", emoji: "🌳", ipa: "/triː/", example_en: "The tree is very tall.", example_vi: "Cái cây rất cao." },
  { en: "house", vi: "ngôi nhà", level: "A1", category: "Đồ vật", emoji: "🏠", ipa: "/haʊs/", example_en: "We live in a house.", example_vi: "Chúng tôi sống trong một ngôi nhà." },
  { en: "car", vi: "ô tô", level: "A1", category: "Đồ vật", emoji: "🚗", ipa: "/kɑːr/", example_en: "The car is very fast.", example_vi: "Chiếc ô tô chạy rất nhanh." },
  { en: "hand", vi: "bàn tay", level: "A1", category: "Cơ thể", emoji: "✋", ipa: "/hænd/", example_en: "Wash your hands.", example_vi: "Rửa tay của bạn." },
  { en: "eye", vi: "mắt", level: "A1", category: "Cơ thể", emoji: "👁️", ipa: "/aɪ/", example_en: "Close your eyes.", example_vi: "Nhắm mắt lại." },
  { en: "school", vi: "trường học", level: "A1", category: "Đời sống", emoji: "🏫", ipa: "/skuːl/", example_en: "I go to school every day.", example_vi: "Tôi đi học mỗi ngày." },
  { en: "mother", vi: "mẹ", level: "A1", category: "Gia đình", emoji: "👩", ipa: "/ˈmʌð.ər/", example_en: "My mother cooks well.", example_vi: "Mẹ tôi nấu ăn ngon." },
  { en: "father", vi: "bố", level: "A1", category: "Gia đình", emoji: "👨", ipa: "/ˈfɑː.ðər/", example_en: "My father works a lot.", example_vi: "Bố tôi làm việc rất nhiều." },
  { en: "friend", vi: "bạn bè", level: "A1", category: "Đời sống", emoji: "🤝", ipa: "/frend/", example_en: "He is my best friend.", example_vi: "Cậu ấy là bạn thân của tôi." },
  { en: "eat", vi: "ăn", level: "A1", category: "Động từ", emoji: "🍽️", ipa: "/iːt/", example_en: "I eat rice every day.", example_vi: "Tôi ăn cơm mỗi ngày." },
  { en: "drink", vi: "uống", level: "A1", category: "Động từ", emoji: "🥤", ipa: "/drɪŋk/", example_en: "Drink some water.", example_vi: "Uống chút nước đi." },
  { en: "run", vi: "chạy", level: "A1", category: "Động từ", emoji: "🏃", ipa: "/rʌn/", example_en: "I run every morning.", example_vi: "Tôi chạy mỗi sáng." },
  { en: "sleep", vi: "ngủ", level: "A1", category: "Động từ", emoji: "😴", ipa: "/sliːp/", example_en: "I sleep at ten o'clock.", example_vi: "Tôi ngủ lúc mười giờ." },
  { en: "good", vi: "tốt", level: "A1", category: "Tính từ", emoji: "👍", ipa: "/ɡʊd/", example_en: "This is a good book.", example_vi: "Đây là một quyển sách hay." },

  // ---------------------------- A2 ----------------------------
  { en: "kitchen", vi: "nhà bếp", level: "A2", category: "Đời sống", emoji: "🍳", ipa: "/ˈkɪtʃ.ɪn/", example_en: "The kitchen is clean.", example_vi: "Nhà bếp sạch sẽ." },
  { en: "garden", vi: "khu vườn", level: "A2", category: "Thiên nhiên", emoji: "🌷", ipa: "/ˈɡɑː.dən/", example_en: "We grow flowers in the garden.", example_vi: "Chúng tôi trồng hoa trong vườn." },
  { en: "market", vi: "cái chợ", level: "A2", category: "Đời sống", emoji: "🏪", ipa: "/ˈmɑː.kɪt/", example_en: "She goes to the market.", example_vi: "Cô ấy đi chợ." },
  { en: "hospital", vi: "bệnh viện", level: "A2", category: "Đời sống", emoji: "🏥", ipa: "/ˈhɒs.pɪ.təl/", example_en: "The hospital is near here.", example_vi: "Bệnh viện ở gần đây." },
  { en: "weather", vi: "thời tiết", level: "A2", category: "Thiên nhiên", emoji: "🌤️", ipa: "/ˈweð.ər/", example_en: "The weather is nice today.", example_vi: "Hôm nay thời tiết đẹp." },
  { en: "weekend", vi: "cuối tuần", level: "A2", category: "Thời gian", emoji: "📅", ipa: "/ˌwiːkˈend/", example_en: "See you this weekend.", example_vi: "Hẹn gặp bạn cuối tuần này." },
  { en: "breakfast", vi: "bữa sáng", level: "A2", category: "Đồ ăn", emoji: "🥐", ipa: "/ˈbrek.fəst/", example_en: "I have breakfast at seven.", example_vi: "Tôi ăn sáng lúc bảy giờ." },
  { en: "message", vi: "tin nhắn", level: "A2", category: "Đời sống", emoji: "💬", ipa: "/ˈmes.ɪdʒ/", example_en: "Send me a message.", example_vi: "Gửi tin nhắn cho tôi." },
  { en: "neighbor", vi: "hàng xóm", level: "A2", category: "Đời sống", emoji: "🏘️", ipa: "/ˈneɪ.bər/", example_en: "My neighbor is kind.", example_vi: "Hàng xóm của tôi rất tốt bụng." },
  { en: "borrow", vi: "mượn", level: "A2", category: "Động từ", emoji: "🤲", ipa: "/ˈbɒr.əʊ/", example_en: "Can I borrow your pen?", example_vi: "Tôi mượn bút của bạn được không?" },
  { en: "travel", vi: "đi du lịch", level: "A2", category: "Động từ", emoji: "✈️", ipa: "/ˈtræv.əl/", example_en: "I love to travel.", example_vi: "Tôi rất thích đi du lịch." },
  { en: "arrive", vi: "đến nơi", level: "A2", category: "Động từ", emoji: "🛬", ipa: "/əˈraɪv/", example_en: "We arrive at noon.", example_vi: "Chúng tôi đến vào buổi trưa." },
  { en: "decide", vi: "quyết định", level: "A2", category: "Động từ", emoji: "🤔", ipa: "/dɪˈsaɪd/", example_en: "You must decide now.", example_vi: "Bạn phải quyết định ngay bây giờ." },
  { en: "invite", vi: "mời", level: "A2", category: "Động từ", emoji: "💌", ipa: "/ɪnˈvaɪt/", example_en: "I invite you to dinner.", example_vi: "Tôi mời bạn đến ăn tối." },
  { en: "healthy", vi: "khỏe mạnh", level: "A2", category: "Tính từ", emoji: "💪", ipa: "/ˈhel.θi/", example_en: "Fruit is healthy.", example_vi: "Trái cây rất tốt cho sức khỏe." },
  { en: "quiet", vi: "yên tĩnh", level: "A2", category: "Tính từ", emoji: "🤫", ipa: "/ˈkwaɪ.ət/", example_en: "The library is quiet.", example_vi: "Thư viện rất yên tĩnh." },
  { en: "busy", vi: "bận rộn", level: "A2", category: "Tính từ", emoji: "🐝", ipa: "/ˈbɪz.i/", example_en: "I am busy today.", example_vi: "Hôm nay tôi bận." },
  { en: "village", vi: "ngôi làng", level: "A2", category: "Đời sống", emoji: "🏡", ipa: "/ˈvɪl.ɪdʒ/", example_en: "He lives in a small village.", example_vi: "Cậu ấy sống ở một ngôi làng nhỏ." },
  { en: "bridge", vi: "cây cầu", level: "A2", category: "Đời sống", emoji: "🌉", ipa: "/brɪdʒ/", example_en: "The bridge is very long.", example_vi: "Cây cầu rất dài." },
  { en: "ticket", vi: "cái vé", level: "A2", category: "Đời sống", emoji: "🎫", ipa: "/ˈtɪk.ɪt/", example_en: "Buy a ticket, please.", example_vi: "Làm ơn mua một chiếc vé." },

  // ---------------------------- B1 ----------------------------
  { en: "achieve", vi: "đạt được", level: "B1", category: "Động từ", emoji: "🎯", ipa: "/əˈtʃiːv/", example_en: "She achieved her goal.", example_vi: "Cô ấy đã đạt được mục tiêu." },
  { en: "attitude", vi: "thái độ", level: "B1", category: "Danh từ", emoji: "🧭", ipa: "/ˈæt.ɪ.tʃuːd/", example_en: "His attitude is positive.", example_vi: "Thái độ của anh ấy rất tích cực." },
  { en: "benefit", vi: "lợi ích", level: "B1", category: "Danh từ", emoji: "🎁", ipa: "/ˈben.ɪ.fɪt/", example_en: "Exercise has many benefits.", example_vi: "Tập thể dục có nhiều lợi ích." },
  { en: "challenge", vi: "thử thách", level: "B1", category: "Danh từ", emoji: "⛰️", ipa: "/ˈtʃæl.ɪndʒ/", example_en: "This is a big challenge.", example_vi: "Đây là một thử thách lớn." },
  { en: "community", vi: "cộng đồng", level: "B1", category: "Danh từ", emoji: "🏘️", ipa: "/kəˈmjuː.nə.ti/", example_en: "Our community is friendly.", example_vi: "Cộng đồng của chúng tôi rất thân thiện." },
  { en: "confident", vi: "tự tin", level: "B1", category: "Tính từ", emoji: "😎", ipa: "/ˈkɒn.fɪ.dənt/", example_en: "Be confident in yourself.", example_vi: "Hãy tự tin vào bản thân." },
  { en: "convenient", vi: "thuận tiện", level: "B1", category: "Tính từ", emoji: "📍", ipa: "/kənˈviː.ni.ənt/", example_en: "The shop is very convenient.", example_vi: "Cửa hàng rất thuận tiện." },
  { en: "develop", vi: "phát triển", level: "B1", category: "Động từ", emoji: "🌱", ipa: "/dɪˈvel.əp/", example_en: "The city develops fast.", example_vi: "Thành phố phát triển nhanh." },
  { en: "efficient", vi: "hiệu quả", level: "B1", category: "Tính từ", emoji: "⚡", ipa: "/ɪˈfɪʃ.ənt/", example_en: "This method is efficient.", example_vi: "Cách này rất hiệu quả." },
  { en: "environment", vi: "môi trường", level: "B1", category: "Danh từ", emoji: "🌍", ipa: "/ɪnˈvaɪ.rən.mənt/", example_en: "We must protect the environment.", example_vi: "Chúng ta phải bảo vệ môi trường." },
  { en: "experience", vi: "kinh nghiệm", level: "B1", category: "Danh từ", emoji: "🎓", ipa: "/ɪkˈspɪə.ri.əns/", example_en: "She has great experience.", example_vi: "Cô ấy có nhiều kinh nghiệm." },
  { en: "government", vi: "chính phủ", level: "B1", category: "Danh từ", emoji: "🏛️", ipa: "/ˈɡʌv.ən.mənt/", example_en: "The government made a new law.", example_vi: "Chính phủ đã ban hành luật mới." },
  { en: "improve", vi: "cải thiện", level: "B1", category: "Động từ", emoji: "📈", ipa: "/ɪmˈpruːv/", example_en: "I want to improve my English.", example_vi: "Tôi muốn cải thiện tiếng Anh." },
  { en: "influence", vi: "ảnh hưởng", level: "B1", category: "Danh từ", emoji: "🌊", ipa: "/ˈɪn.flu.əns/", example_en: "Music influences my mood.", example_vi: "Âm nhạc ảnh hưởng đến tâm trạng tôi." },
  { en: "knowledge", vi: "kiến thức", level: "B1", category: "Danh từ", emoji: "📖", ipa: "/ˈnɒl.ɪdʒ/", example_en: "Knowledge is power.", example_vi: "Kiến thức là sức mạnh." },
  { en: "opportunity", vi: "cơ hội", level: "B1", category: "Danh từ", emoji: "🚪", ipa: "/ˌɒp.əˈtʃuː.nə.ti/", example_en: "This is a good opportunity.", example_vi: "Đây là một cơ hội tốt." },
  { en: "organize", vi: "tổ chức", level: "B1", category: "Động từ", emoji: "🗂️", ipa: "/ˈɔː.ɡən.aɪz/", example_en: "They organize a party.", example_vi: "Họ tổ chức một bữa tiệc." },
  { en: "pollution", vi: "ô nhiễm", level: "B1", category: "Danh từ", emoji: "🏭", ipa: "/pəˈluː.ʃən/", example_en: "Air pollution is serious.", example_vi: "Ô nhiễm không khí rất nghiêm trọng." },
  { en: "protect", vi: "bảo vệ", level: "B1", category: "Động từ", emoji: "🛡️", ipa: "/prəˈtekt/", example_en: "Protect the forests.", example_vi: "Hãy bảo vệ rừng." },
  { en: "relationship", vi: "mối quan hệ", level: "B1", category: "Danh từ", emoji: "💞", ipa: "/rɪˈleɪ.ʃən.ʃɪp/", example_en: "They have a good relationship.", example_vi: "Họ có một mối quan hệ tốt." },

  // ---------------------------- B2 ----------------------------
  { en: "ambiguous", vi: "mơ hồ", level: "B2", category: "Tính từ", emoji: "🌫️", ipa: "/æmˈbɪɡ.ju.əs/", example_en: "His answer was ambiguous.", example_vi: "Câu trả lời của anh ấy rất mơ hồ." },
  { en: "anticipate", vi: "đoán trước", level: "B2", category: "Động từ", emoji: "🔮", ipa: "/ænˈtɪs.ɪ.peɪt/", example_en: "We anticipate a busy day.", example_vi: "Chúng tôi đoán trước một ngày bận rộn." },
  { en: "comprehensive", vi: "toàn diện", level: "B2", category: "Tính từ", emoji: "🧩", ipa: "/ˌkɒm.prɪˈhen.sɪv/", example_en: "She gave a comprehensive report.", example_vi: "Cô ấy đưa ra một báo cáo toàn diện." },
  { en: "controversial", vi: "gây tranh cãi", level: "B2", category: "Tính từ", emoji: "🔥", ipa: "/ˌkɒn.trəˈvɜː.ʃəl/", example_en: "It is a controversial topic.", example_vi: "Đó là một chủ đề gây tranh cãi." },
  { en: "demonstrate", vi: "chứng minh, trình bày", level: "B2", category: "Động từ", emoji: "📊", ipa: "/ˈdem.ən.streɪt/", example_en: "Let me demonstrate the method.", example_vi: "Để tôi trình bày phương pháp này." },
  { en: "emphasize", vi: "nhấn mạnh", level: "B2", category: "Động từ", emoji: "‼️", ipa: "/ˈem.fə.saɪz/", example_en: "He emphasized the deadline.", example_vi: "Anh ấy nhấn mạnh thời hạn." },
  { en: "inevitable", vi: "không thể tránh khỏi", level: "B2", category: "Tính từ", emoji: "⏳", ipa: "/ɪˈnev.ɪ.tə.bəl/", example_en: "Change is inevitable.", example_vi: "Thay đổi là điều không thể tránh khỏi." },
  { en: "negotiate", vi: "thương lượng", level: "B2", category: "Động từ", emoji: "🤝", ipa: "/nəˈɡəʊ.ʃi.eɪt/", example_en: "They negotiate the price.", example_vi: "Họ thương lượng về giá cả." },
  { en: "obstacle", vi: "trở ngại", level: "B2", category: "Danh từ", emoji: "🚧", ipa: "/ˈɒb.stə.kəl/", example_en: "Fear is a big obstacle.", example_vi: "Nỗi sợ là một trở ngại lớn." },
  { en: "persistent", vi: "kiên trì", level: "B2", category: "Tính từ", emoji: "🐢", ipa: "/pəˈsɪs.tənt/", example_en: "Be persistent in your work.", example_vi: "Hãy kiên trì trong công việc." },
  { en: "privilege", vi: "đặc quyền", level: "B2", category: "Danh từ", emoji: "🎖️", ipa: "/ˈprɪv.əl.ɪdʒ/", example_en: "Education is a privilege.", example_vi: "Giáo dục là một đặc quyền." },
  { en: "reluctant", vi: "miễn cưỡng", level: "B2", category: "Tính từ", emoji: "😕", ipa: "/rɪˈlʌk.tənt/", example_en: "She was reluctant to go.", example_vi: "Cô ấy miễn cưỡng phải đi." },
  { en: "significant", vi: "đáng kể, quan trọng", level: "B2", category: "Tính từ", emoji: "📌", ipa: "/sɪɡˈnɪf.ɪ.kənt/", example_en: "There is a significant change.", example_vi: "Có một sự thay đổi đáng kể." },
  { en: "substantial", vi: "lớn lao, đáng kể", level: "B2", category: "Tính từ", emoji: "📦", ipa: "/səbˈstæn.ʃəl/", example_en: "A substantial amount of money.", example_vi: "Một số tiền đáng kể." },
  { en: "sophisticated", vi: "tinh vi, phức tạp", level: "B2", category: "Tính từ", emoji: "🎩", ipa: "/səˈfɪs.tɪ.keɪ.tɪd/", example_en: "A sophisticated system.", example_vi: "Một hệ thống tinh vi." },
  { en: "threaten", vi: "đe dọa", level: "B2", category: "Động từ", emoji: "😠", ipa: "/ˈθret.ən/", example_en: "Don't threaten me.", example_vi: "Đừng đe dọa tôi." },
  { en: "tolerance", vi: "lòng khoan dung", level: "B2", category: "Danh từ", emoji: "🕊️", ipa: "/ˈtɒl.ər.əns/", example_en: "We need more tolerance.", example_vi: "Chúng ta cần thêm lòng khoan dung." },
  { en: "undermine", vi: "làm suy yếu", level: "B2", category: "Động từ", emoji: "🕳️", ipa: "/ˌʌn.dəˈmaɪn/", example_en: "Don't undermine her confidence.", example_vi: "Đừng làm suy yếu sự tự tin của cô ấy." },
  { en: "vulnerable", vi: "dễ bị tổn thương", level: "B2", category: "Tính từ", emoji: "🥚", ipa: "/ˈvʌl.nər.ə.bəl/", example_en: "Children are vulnerable.", example_vi: "Trẻ em rất dễ bị tổn thương." },
  { en: "acknowledge", vi: "thừa nhận", level: "B2", category: "Động từ", emoji: "✔️", ipa: "/əkˈnɒl.ɪdʒ/", example_en: "I acknowledge my mistake.", example_vi: "Tôi thừa nhận lỗi của mình." },

  // ---------------------------- C1 ----------------------------
  { en: "alleviate", vi: "làm dịu bớt", level: "C1", category: "Động từ", emoji: "💊", ipa: "/əˈliː.vi.eɪt/", example_en: "This medicine alleviates pain.", example_vi: "Thuốc này làm dịu cơn đau." },
  { en: "coherent", vi: "mạch lạc", level: "C1", category: "Tính từ", emoji: "🧵", ipa: "/kəʊˈhɪə.rənt/", example_en: "A coherent argument.", example_vi: "Một lập luận mạch lạc." },
  { en: "compelling", vi: "hấp dẫn, thuyết phục", level: "C1", category: "Tính từ", emoji: "🎬", ipa: "/kəmˈpel.ɪŋ/", example_en: "A compelling story.", example_vi: "Một câu chuyện hấp dẫn." },
  { en: "detrimental", vi: "có hại", level: "C1", category: "Tính từ", emoji: "☠️", ipa: "/ˌdet.rɪˈmen.təl/", example_en: "Smoking is detrimental to health.", example_vi: "Hút thuốc có hại cho sức khỏe." },
  { en: "elicit", vi: "gợi ra, khơi ra", level: "C1", category: "Động từ", emoji: "🎣", ipa: "/ɪˈlɪs.ɪt/", example_en: "The joke elicited laughter.", example_vi: "Câu chuyện cười gợi ra tiếng cười." },
  { en: "exacerbate", vi: "làm trầm trọng thêm", level: "C1", category: "Động từ", emoji: "🔥", ipa: "/ɪɡˈzæs.ə.beɪt/", example_en: "Stress exacerbates the illness.", example_vi: "Căng thẳng làm bệnh trầm trọng hơn." },
  { en: "feasible", vi: "khả thi", level: "C1", category: "Tính từ", emoji: "🛠️", ipa: "/ˈfiː.zə.bəl/", example_en: "Is this plan feasible?", example_vi: "Kế hoạch này có khả thi không?" },
  { en: "meticulous", vi: "tỉ mỉ", level: "C1", category: "Tính từ", emoji: "🔍", ipa: "/məˈtɪk.jə.ləs/", example_en: "She is meticulous about details.", example_vi: "Cô ấy rất tỉ mỉ về chi tiết." },
  { en: "negligible", vi: "không đáng kể", level: "C1", category: "Tính từ", emoji: "🪶", ipa: "/ˈneɡ.lɪ.dʒə.bəl/", example_en: "The difference is negligible.", example_vi: "Sự khác biệt không đáng kể." },
  { en: "nuance", vi: "sắc thái", level: "C1", category: "Danh từ", emoji: "🎨", ipa: "/ˈnjuː.ɑːns/", example_en: "The nuance is hard to see.", example_vi: "Sắc thái này khó nhận ra." },
  { en: "paradigm", vi: "mô hình, hệ hình", level: "C1", category: "Danh từ", emoji: "🧠", ipa: "/ˈpær.ə.daɪm/", example_en: "A new paradigm of thinking.", example_vi: "Một mô hình tư duy mới." },
  { en: "plausible", vi: "hợp lý, đáng tin", level: "C1", category: "Tính từ", emoji: "🤝", ipa: "/ˈplɔː.zə.bəl/", example_en: "A plausible explanation.", example_vi: "Một lời giải thích hợp lý." },
  { en: "pragmatic", vi: "thực dụng", level: "C1", category: "Tính từ", emoji: "🔧", ipa: "/præɡˈmæt.ɪk/", example_en: "A pragmatic approach.", example_vi: "Một cách tiếp cận thực dụng." },
  { en: "scrutinize", vi: "xem xét kỹ lưỡng", level: "C1", category: "Động từ", emoji: "🔬", ipa: "/ˈskruː.tə.naɪz/", example_en: "They scrutinize the data.", example_vi: "Họ xem xét kỹ lưỡng dữ liệu." },
  { en: "resilience", vi: "khả năng phục hồi", level: "C1", category: "Danh từ", emoji: "🌿", ipa: "/rɪˈzɪl.i.əns/", example_en: "She showed great resilience.", example_vi: "Cô ấy thể hiện khả năng phục hồi tốt." },

  // ---------------------------- C2 ----------------------------
  { en: "ephemeral", vi: "phù du, chóng tàn", level: "C2", category: "Tính từ", emoji: "🫧", ipa: "/ɪˈfem.ər.əl/", example_en: "Fame is ephemeral.", example_vi: "Danh vọng là phù du." },
  { en: "ubiquitous", vi: "có mặt khắp nơi", level: "C2", category: "Tính từ", emoji: "🌐", ipa: "/juːˈbɪk.wɪ.təs/", example_en: "Smartphones are ubiquitous.", example_vi: "Điện thoại thông minh có mặt khắp nơi." },
  { en: "cacophony", vi: "âm thanh hỗn tạp", level: "C2", category: "Danh từ", emoji: "🔊", ipa: "/kəˈkɒf.ə.ni/", example_en: "A cacophony of sounds.", example_vi: "Một thứ âm thanh hỗn tạp." },
  { en: "clandestine", vi: "bí mật, lén lút", level: "C2", category: "Tính từ", emoji: "🕵️", ipa: "/klænˈdes.tɪn/", example_en: "A clandestine meeting.", example_vi: "Một cuộc gặp bí mật." },
  { en: "dichotomy", vi: "sự đối lập", level: "C2", category: "Danh từ", emoji: "☯️", ipa: "/daɪˈkɒt.ə.mi/", example_en: "A false dichotomy.", example_vi: "Một sự đối lập giả tạo." },
  { en: "egregious", vi: "quá đáng, nghiêm trọng", level: "C2", category: "Tính từ", emoji: "🚨", ipa: "/ɪˈɡriː.dʒəs/", example_en: "An egregious error.", example_vi: "Một lỗi quá đáng." },
  { en: "idiosyncrasy", vi: "nét riêng kỳ lạ", level: "C2", category: "Danh từ", emoji: "🌀", ipa: "/ˌɪd.i.əˈsɪŋ.krə.si/", example_en: "Everyone has idiosyncrasies.", example_vi: "Ai cũng có những nét riêng kỳ lạ." },
  { en: "obfuscate", vi: "làm khó hiểu", level: "C2", category: "Động từ", emoji: "🌫️", ipa: "/ˈɒb.fʌs.keɪt/", example_en: "He tried to obfuscate the facts.", example_vi: "Anh ấy cố làm mờ đi sự thật." },
  { en: "pernicious", vi: "độc hại ngầm", level: "C2", category: "Tính từ", emoji: "🐍", ipa: "/pəˈnɪʃ.əs/", example_en: "A pernicious rumor.", example_vi: "Một tin đồn độc hại." },
  { en: "taciturn", vi: "ít nói", level: "C2", category: "Tính từ", emoji: "🤐", ipa: "/ˈtæs.ɪ.tɜːn/", example_en: "He is calm and taciturn.", example_vi: "Anh ấy bình tĩnh và ít nói." },
];

const INSERT_SQL = `INSERT OR IGNORE INTO words
  (en, vi, ipa, emoji, example_en, example_vi, level, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

export async function seedIfEmpty(force = false) {
  await initDb();
  const row = await get("SELECT COUNT(*) AS c FROM words");
  if (Number(row.c) > 0 && !force) return false;
  if (force) await run("DELETE FROM words");

  const stmts = WORDS.map((w) => ({
    sql: INSERT_SQL,
    args: [w.en, w.vi, w.ipa, w.emoji, w.example_en, w.example_vi, w.level, w.category],
  }));

  // Batch in chunks (works the same against a local file or Turso).
  for (let i = 0; i < stmts.length; i += 50) {
    await client.batch(stmts.slice(i, i + 50), "write");
  }
  console.log(`[seed] đã nạp ${WORDS.length} từ vựng.`);
  return true;
}

// Allow "node server/seed.js --force" as a standalone reseed.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const force = process.argv.includes("--force");
  seedIfEmpty(force)
    .then(() => console.log("[seed] xong."))
    .catch((e) => {
      console.error("[seed] lỗi:", e.message);
      process.exit(1);
    });
}
