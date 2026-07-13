# Bohinj Ski Week - Project Context

**Дата обновления:** 12.01.2026

---

## Текущий статус: ГОТОВО К ГЕНЕРАЦИИ ЛИДОВ

**Лендинг:** https://bohinj-ski-week.vercel.app
**GitHub:** https://github.com/vitalykurilov-sys/bohinj-ski-week

---

## Что работает

| Компонент | Статус | Детали |
|-----------|--------|--------|
| Лендинг | ✅ | На английском, форма бронирования |
| Telegram бот | ✅ | @bohinjski_booking_bot → заявки приходят @vitalykurilov |
| Google Sheets | ✅ | Все лиды сохраняются автоматически |
| Email Петеру | ⏳ | Пока вручную, можно добавить Resend |

---

## Telegram бот

- **Бот:** @bohinjski_booking_bot
- **Токен:** `7815290962:AAHqId2EFK0T2QOcgJ7xIm1XM8WgAPapPBQ`
- **Chat ID:** `384905363`
- **Заявки приходят:** мгновенно при отправке формы

---

## Google Sheets

- **Таблица:** Bohinj Ski Leads (в твоём Google Drive)
- **URL:** https://docs.google.com/spreadsheets/d/1d2izG1DEoKwpEQx1kUgB3bpvU_9IgzJ8Vs0IKHd-67g/edit
- **Колонки:** Date | Name | Email | Phone | Dates | People | Message | Status
- **Apps Script URL:** `https://script.google.com/macros/s/AKfycby-u39EYhpW54wzG7SEMwJYI1x1vLuk1C7vQuTAV-sPmubJPnFYaXqH3vgaOvGs-SRgbg/exec`

> С 12.05.2026 в Sheet также пишутся `consent`, `marketing`, `consentTimestamp` (GDPR audit trail). Если таблица не отображает эти колонки - надо добавить заголовки или обновить Apps Script.

---

## Vercel Environment Variables

| Key | Value |
|-----|-------|
| TELEGRAM_BOT_TOKEN | 7815290962:AAHqId2EFK0T2QOcgJ7xIm1XM8WgAPapPBQ |
| TELEGRAM_CHAT_ID | 384905363 |
| PETER_EMAIL | teniska.sola@gmail.com |
| GOOGLE_SHEETS_URL | https://script.google.com/macros/s/AKfycby-u39EYhpW54wzG7SEMwJYI1x1vLuk1C7vQuTAV-sPmubJPnFYaXqH3vgaOvGs-SRgbg/exec |

---

## Контакты

**Петер (Apartmaji Žnidar):**
- Email: teniska.sola@gmail.com
- Телефон: +386 51 362 390
- Facebook: есть страница с парой тысяч подписчиков (словенский)

---

## Что отправлено Петеру (ждём выполнения)

### 1. WhatsApp рассылка по базе клиентов

Текст для рассылки:
```
Hi! 👋

This is Peter from Apartmaji Žnidar.
Remember your holiday in Bohinj?

This winter we're launching something NEW:
Learn to Ski program for families!

✓ 5 days with professional instructor
✓ Perfect for beginners
✓ Aquapark access for non-skiers
✓ 30-40% cheaper than Austria/France

Check it out:
https://bohinj-ski-week.vercel.app
```

### 2. Facebook пост (словенский)

Петер должен:
- Использовать свои фото (школа, инструкторы)
- Перевести текст на словенский
- Добавить ссылку на лендинг

---

## Следующие шаги (органика)

### Целевые аудитории:
1. **Венгры** — приоритет #1 (нет гор, 3-4ч езды, 10 млн рынок)
2. **Хорваты** — 2ч до Загреба, знают Словению
3. **Русские в ЕС** — Telegram группы

### Что нужно сделать:

**Facebook (венгры + хорваты):**
- [ ] Найти 5-10 групп про лыжи / семейный отдых / путешествия
- [ ] Вступить (от имени Петера или своего)
- [ ] Подготовить посты на английском
- [ ] Постить 1-2 группы в день

**Telegram (русские):**
- [ ] Найти группы: русские в Словении, Австрии, Италии
- [ ] Узнать условия размещения (часто платное)
- [ ] Подготовить пост на русском

### Примеры постов для групп:

**Венгры (English):**
```
🎿 No mountains in Hungary? Try Slovenia!

Learn to ski in Bohinj — just 3 hours from Budapest.
5-day program for families and beginners.
30-40% cheaper than Austria.

Details: https://bohinj-ski-week.vercel.app

Anyone tried skiing in Slovenia?
```

**Хорваты (English):**
```
🎿 Zagreb → Bohinj = 2 hours!

This winter — learn to ski in beautiful Slovenian Alps.
Perfect for beginners and families.

✓ Professional instructors
✓ Aquapark for non-skiers
✓ Great prices

https://bohinj-ski-week.vercel.app
```

**Русские (Russian):**
```
🎿 Научиться кататься на лыжах в Словении

Бохинь — 5-дневная программа для семей и начинающих.
На 30-40% дешевле Австрии.
Аквапарк для тех кто не катается.

Подробности: https://bohinj-ski-week.vercel.app

Кто катался в Словении — как впечатления?
```

---

## Бизнес-модель

- **Комиссия:** 10% с каждой продажи через лендинг
- **Цены:** €1,650 - €3,980 (зависит от количества людей)
- **Пример:** 4 человека = €2,650 → твоя комиссия = €265
- **Цель Петера:** заполнить будние дни (выходные и так заняты)

---

## Воронка продаж

```
ТРАФИК (FB группы, WhatsApp база, TG)
    ↓
ЛЕНДИНГ (bohinj-ski-week.vercel.app)
    ↓
ЗАЯВКА (форма → Telegram + Google Sheets)
    ↓
КОНТАКТ (Петер звонит/пишет)
    ↓
ОПЛАТА (бронирование)
    ↓
КОМИССИЯ 10%
```

---

## При возврате к проекту

Скажи: "Продолжаем с Bohinj" — и я прочитаю этот файл.

**Ближайшие действия:**
1. Проверить — сделал ли Петер FB пост и WhatsApp рассылку
2. Начать искать FB группы (венгры, хорваты)
3. Найти TG группы (русские в ЕС)

---

*Последнее обновление: 12.01.2026, 13:30*
