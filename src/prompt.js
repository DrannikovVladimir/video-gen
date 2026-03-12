import readline from 'readline';

// Создаём интерфейс для чтения из терминала
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Вспомогательная функция — задаёт вопрос и возвращает ответ
function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Собираем все данные о товаре
export async function collectInput() {
  console.log('\n🎬 Video Generator — введи данные о товаре\n');

  const name     = await ask('📦 Название товара: ');
  const oldPrice = await ask('💸 Старая цена (руб): ');
  const newPrice = await ask('✅ Новая цена (руб): ');
  const image    = await ask('🖼  Путь к картинке (например C:\\Users\\...\\photo.jpg): ');
  const voiceText = await ask('🎙  Текст для озвучки: ');

  rl.close();

  return { name, oldPrice, newPrice, image, voiceText };
}