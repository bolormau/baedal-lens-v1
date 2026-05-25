import type { PrismaClient, FoodCategory, WeatherType, PM25Level } from "@prisma/client"

type MockOrder = {
  restaurant: string
  category: FoodCategory
  items: Array<{ name: string; quantity: number; plasticG: number }>
  plasticG: number
  actualG: number
  unrequested: string[]
  weather: WeatherType
  pm25: PM25Level
  weekOffset: number
  hourOfDay: number
}

function getScannedAt(weekOffset: number, hour: number): Date {
  const now = new Date()
  const daysAgo = weekOffset * 7 + Math.floor(Math.random() * 4)
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return date
}

function generateLenses(
  plasticG: number,
  category: string,
  unrequested: string[]
): Array<{ type: string; emoji: string; text: string }> {
  const year = new Date().getFullYear() + 400
  const lensMap = {
    invisibility: { type: "invisibility", emoji: "👻", text: "소스컵 등은 주문한 게 아니야. 그냥 딸려왔어." },
    time: { type: "time", emoji: "⏰", text: `지금 시킨 플라스틱, ${year}년에도 어딘가에 있어.` },
    scale: { type: "scale", emoji: "⚖️", text: `이번 용기 다 모으면 페트병 ${Math.round(plasticG / 31)}개 무게야.` },
    accumulation: { type: "accumulation", emoji: "📦", text: "이 페이스면 1년에 배달 용기만 수백 개야." },
  }
  if (unrequested.length > 0) return [lensMap.invisibility, lensMap.time, lensMap.scale]
  if (category === "CHICKEN") return [lensMap.scale, lensMap.accumulation, lensMap.time]
  return [lensMap.scale, lensMap.time, lensMap.accumulation]
}

const MOCK_ORDERS: MockOrder[] = [
  { restaurant: "교촌치킨 마포공덕점", category: "CHICKEN", items: [{ name: "교촌오리지날 한마리", quantity: 1, plasticG: 208 }, { name: "콜라 1.25L", quantity: 1, plasticG: 14 }], plasticG: 260, actualG: 312, unrequested: ["소스컵 ×4", "비닐봉투", "물티슈"], weather: "RAINY", pm25: "BAD", weekOffset: 5, hourOfDay: 19 },
  { restaurant: "메가MGC커피 마포역점", category: "OTHER", items: [{ name: "아이스 아메리카노", quantity: 2, plasticG: 28 }, { name: "케이크 조각", quantity: 1, plasticG: 14 }], plasticG: 104, actualG: 104, unrequested: ["빨대 ×2"], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 5, hourOfDay: 11 },
  { restaurant: "홍콩반점0410 마포공덕점", category: "CHINESE", items: [{ name: "짜장면", quantity: 1, plasticG: 52 }, { name: "짬뽕", quantity: 1, plasticG: 52 }, { name: "탕수육 소", quantity: 1, plasticG: 52 }], plasticG: 260, actualG: 260, unrequested: [], weather: "SUNNY", pm25: "GOOD", weekOffset: 5, hourOfDay: 12 },
  { restaurant: "BBQ 황금올리브 마포점", category: "CHICKEN", items: [{ name: "황금올리브 한마리", quantity: 1, plasticG: 208 }], plasticG: 260, actualG: 286, unrequested: ["소스컵 ×3", "비닐봉투"], weather: "RAINY", pm25: "BAD", weekOffset: 5, hourOfDay: 20 },
  { restaurant: "도미노피자 마포점", category: "PIZZA", items: [{ name: "슈퍼디럭스 M", quantity: 1, plasticG: 52 }, { name: "포테이토 S", quantity: 1, plasticG: 52 }, { name: "콜라 1.25L", quantity: 1, plasticG: 14 }], plasticG: 208, actualG: 234, unrequested: ["피클컵", "핫소스팩 ×2"], weather: "SUNNY", pm25: "MODERATE", weekOffset: 4, hourOfDay: 19 },
  { restaurant: "맥도날드 마포공덕점", category: "BURGER", items: [{ name: "빅맥 세트", quantity: 1, plasticG: 52 }, { name: "맥너겟 10조각", quantity: 1, plasticG: 52 }], plasticG: 156, actualG: 182, unrequested: ["케첩팩 ×4", "빨대"], weather: "SUNNY", pm25: "GOOD", weekOffset: 4, hourOfDay: 13 },
  { restaurant: "컴포즈커피 마포점", category: "OTHER", items: [{ name: "아이스 아메리카노 L", quantity: 1, plasticG: 14 }, { name: "바닐라라떼 L", quantity: 1, plasticG: 14 }], plasticG: 52, actualG: 52, unrequested: ["빨대 ×2"], weather: "SUNNY", pm25: "GOOD", weekOffset: 4, hourOfDay: 10 },
  { restaurant: "BHC 뿌링클 마포점", category: "CHICKEN", items: [{ name: "뿌링클 한마리", quantity: 1, plasticG: 208 }, { name: "뿌링클콤보", quantity: 1, plasticG: 52 }], plasticG: 312, actualG: 364, unrequested: ["소스컵 ×4", "비닐봉투 ×2"], weather: "RAINY", pm25: "VERY_BAD", weekOffset: 4, hourOfDay: 20 },
  { restaurant: "한솥도시락 마포점", category: "KOREAN", items: [{ name: "제육볶음 도시락", quantity: 1, plasticG: 104 }, { name: "된장국", quantity: 1, plasticG: 52 }], plasticG: 208, actualG: 208, unrequested: [], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 4, hourOfDay: 12 },
  { restaurant: "죠스떡볶이 마포공덕점", category: "SNACK", items: [{ name: "국물떡볶이 2인분", quantity: 1, plasticG: 104 }, { name: "순대", quantity: 1, plasticG: 52 }, { name: "튀김모듬", quantity: 1, plasticG: 52 }], plasticG: 260, actualG: 260, unrequested: ["포크 ×2"], weather: "RAINY", pm25: "BAD", weekOffset: 3, hourOfDay: 20 },
  { restaurant: "굽네치킨 마포점", category: "CHICKEN", items: [{ name: "볼케이노 한마리", quantity: 1, plasticG: 208 }, { name: "고추바사삭 반마리", quantity: 1, plasticG: 104 }], plasticG: 364, actualG: 416, unrequested: ["소스컵 ×5", "비닐봉투", "물티슈 ×2"], weather: "RAINY", pm25: "BAD", weekOffset: 3, hourOfDay: 19 },
  { restaurant: "스타벅스 마포공덕점", category: "OTHER", items: [{ name: "자바칩 프라푸치노 L", quantity: 1, plasticG: 28 }, { name: "카라멜 마끼아또 L", quantity: 1, plasticG: 28 }], plasticG: 104, actualG: 104, unrequested: ["빨대 ×2"], weather: "SUNNY", pm25: "GOOD", weekOffset: 3, hourOfDay: 11 },
  { restaurant: "버거킹 마포공덕역점", category: "BURGER", items: [{ name: "와퍼 세트", quantity: 2, plasticG: 104 }, { name: "어니언링", quantity: 1, plasticG: 52 }], plasticG: 208, actualG: 234, unrequested: ["케첩팩 ×4", "마요소스팩 ×2"], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 3, hourOfDay: 18 },
  { restaurant: "네네치킨 마포점", category: "CHICKEN", items: [{ name: "네네순살 한마리", quantity: 1, plasticG: 208 }, { name: "코카콜라 500ml", quantity: 2, plasticG: 28 }], plasticG: 312, actualG: 338, unrequested: ["소스컵 ×3", "비닐봉투"], weather: "RAINY", pm25: "BAD", weekOffset: 3, hourOfDay: 20 },
  { restaurant: "이춘복 냉면막국수 마포점", category: "KOREAN", items: [{ name: "물냉면", quantity: 1, plasticG: 52 }, { name: "비빔냉면", quantity: 1, plasticG: 52 }], plasticG: 156, actualG: 156, unrequested: [], weather: "SUNNY", pm25: "GOOD", weekOffset: 3, hourOfDay: 12 },
  { restaurant: "엽기떡볶이 마포점", category: "SNACK", items: [{ name: "엽기떡볶이 2인분", quantity: 1, plasticG: 104 }, { name: "치즈볼", quantity: 1, plasticG: 52 }, { name: "쫄면", quantity: 1, plasticG: 52 }], plasticG: 260, actualG: 286, unrequested: ["비닐봉투", "포크 ×2"], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 2, hourOfDay: 19 },
  { restaurant: "BBQ 황금올리브 마포점", category: "CHICKEN", items: [{ name: "황금올리브 한마리", quantity: 1, plasticG: 208 }, { name: "황금올리브 윙 6개", quantity: 1, plasticG: 52 }, { name: "콜라 1.25L", quantity: 1, plasticG: 14 }], plasticG: 364, actualG: 416, unrequested: ["소스컵 ×5", "비닐봉투 ×2"], weather: "RAINY", pm25: "VERY_BAD", weekOffset: 2, hourOfDay: 20 },
  { restaurant: "이디야커피 마포점", category: "OTHER", items: [{ name: "아이스 아메리카노", quantity: 3, plasticG: 42 }], plasticG: 104, actualG: 104, unrequested: ["빨대 ×3"], weather: "SUNNY", pm25: "MODERATE", weekOffset: 2, hourOfDay: 10 },
  { restaurant: "피자헛 마포공덕점", category: "PIZZA", items: [{ name: "슈퍼슈프림 L", quantity: 1, plasticG: 52 }, { name: "치즈크러스트 M", quantity: 1, plasticG: 52 }, { name: "콜라 1.25L", quantity: 2, plasticG: 28 }], plasticG: 260, actualG: 312, unrequested: ["피클컵 ×2", "핫소스팩 ×3"], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 2, hourOfDay: 19 },
  { restaurant: "교촌치킨 마포공덕점", category: "CHICKEN", items: [{ name: "교촌오리지날 한마리", quantity: 1, plasticG: 208 }, { name: "허니콤보 반마리", quantity: 1, plasticG: 104 }], plasticG: 364, actualG: 390, unrequested: ["소스컵 ×4", "비닐봉투"], weather: "RAINY", pm25: "BAD", weekOffset: 2, hourOfDay: 20 },
  { restaurant: "KFC 마포공덕점", category: "BURGER", items: [{ name: "징거버거 세트", quantity: 1, plasticG: 52 }, { name: "치킨버켓 9조각", quantity: 1, plasticG: 104 }], plasticG: 208, actualG: 234, unrequested: ["케첩팩 ×3"], weather: "SUNNY", pm25: "GOOD", weekOffset: 2, hourOfDay: 13 },
  { restaurant: "신전떡볶이 마포점", category: "SNACK", items: [{ name: "즉석떡볶이 2인분", quantity: 1, plasticG: 104 }, { name: "오뎅", quantity: 1, plasticG: 52 }], plasticG: 208, actualG: 208, unrequested: ["포크 ×2"], weather: "RAINY", pm25: "BAD", weekOffset: 1, hourOfDay: 20 },
  { restaurant: "본죽 마포점", category: "KOREAN", items: [{ name: "전복죽", quantity: 1, plasticG: 104 }, { name: "야채죽", quantity: 1, plasticG: 104 }], plasticG: 208, actualG: 208, unrequested: [], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 1, hourOfDay: 12 },
  { restaurant: "롯데리아 마포공덕점", category: "BURGER", items: [{ name: "AZ버거 세트", quantity: 1, plasticG: 52 }, { name: "불고기버거 세트", quantity: 1, plasticG: 52 }], plasticG: 156, actualG: 182, unrequested: ["케첩팩 ×3", "빨대 ×2"], weather: "SUNNY", pm25: "GOOD", weekOffset: 1, hourOfDay: 18 },
  { restaurant: "굽네치킨 마포점", category: "CHICKEN", items: [{ name: "볼케이노 한마리", quantity: 1, plasticG: 208 }, { name: "갈비천왕 반마리", quantity: 1, plasticG: 104 }, { name: "콜라 1.25L", quantity: 1, plasticG: 14 }], plasticG: 390, actualG: 442, unrequested: ["소스컵 ×5", "비닐봉투 ×2", "물티슈"], weather: "RAINY", pm25: "BAD", weekOffset: 1, hourOfDay: 20 },
  { restaurant: "빽다방 마포점", category: "OTHER", items: [{ name: "아이스 아메리카노 L", quantity: 2, plasticG: 28 }, { name: "빽스치노 L", quantity: 1, plasticG: 14 }], plasticG: 104, actualG: 104, unrequested: ["빨대 ×3"], weather: "SUNNY", pm25: "MODERATE", weekOffset: 1, hourOfDay: 11 },
  { restaurant: "홍콩반점0410 마포공덕점", category: "CHINESE", items: [{ name: "짜장면", quantity: 2, plasticG: 104 }, { name: "탕수육 중", quantity: 1, plasticG: 52 }, { name: "군만두", quantity: 1, plasticG: 52 }], plasticG: 312, actualG: 312, unrequested: ["나무젓가락 ×2"], weather: "CLOUDY", pm25: "MODERATE", weekOffset: 0, hourOfDay: 19 },
  { restaurant: "맘스터치 마포공덕점", category: "BURGER", items: [{ name: "싸이버거 세트", quantity: 2, plasticG: 104 }], plasticG: 156, actualG: 156, unrequested: [], weather: "SUNNY", pm25: "GOOD", weekOffset: 0, hourOfDay: 13 },
  { restaurant: "BBQ 황금올리브 마포점", category: "CHICKEN", items: [{ name: "황금올리브 한마리", quantity: 1, plasticG: 208 }, { name: "황금올리브 윙 9개", quantity: 1, plasticG: 52 }, { name: "치즈볼", quantity: 1, plasticG: 52 }], plasticG: 416, actualG: 468, unrequested: ["소스컵 ×5", "비닐봉투 ×2", "물티슈 ×2"], weather: "RAINY", pm25: "VERY_BAD", weekOffset: 0, hourOfDay: 20 },
  { restaurant: "피자알볼로 마포점", category: "PIZZA", items: [{ name: "알볼로피자 L", quantity: 1, plasticG: 52 }, { name: "포테이토피자 M", quantity: 1, plasticG: 52 }], plasticG: 208, actualG: 234, unrequested: ["피클컵", "핫소스팩 ×2"], weather: "SUNNY", pm25: "MODERATE", weekOffset: 0, hourOfDay: 19 },
]

export async function seedMockOrdersForUser(
  prismaClient: PrismaClient,
  userId: string
): Promise<void> {
  const data = MOCK_ORDERS.map((order) => ({
    userId,
    restaurant: order.restaurant,
    category: order.category,
    items: order.items,
    plasticG: order.plasticG,
    actualG: order.actualG,
    unrequested: order.unrequested,
    weather: order.weather,
    pm25: order.pm25,
    usedMessage: false as boolean,
    lenses: generateLenses(order.plasticG, order.category, order.unrequested),
    scannedAt: getScannedAt(order.weekOffset, order.hourOfDay),
  }))

  await prismaClient.order.createMany({ data })
}
