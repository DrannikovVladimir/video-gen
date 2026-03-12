import { collectInput } from './src/prompt.js';

const data = await collectInput();
console.log('\n✅ Получены данные:', data);