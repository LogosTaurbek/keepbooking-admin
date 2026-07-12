# Changelog

Формат по мотивам [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/). Версий/тегов пока нет — записи сгруппированы по дате.

## [Unreleased] — 2026-07-13

### Added — CI (GitHub Actions)
- `.github/workflows/ci.yml`: Node 20, `npm ci` → `npm run lint` → `npm run build` (`tsc -b && vite build`, тайпчек и сборка одной командой)
- По пути прогнал `lint` сам и нашёл 1 warning (`react-refresh/only-export-components` — `AuthContext.tsx` экспортировал вперемешку компонент, hook и context). Не заглушил, а разнёс по файлам как положено: `context.ts` (`createContext`), `AuthContext.tsx` (только `AuthProvider`), `useAuth.ts` (хук) — lint теперь чистый, 0 warnings

### Added — Управление бронями ресторана
- `RestaurantBookingsPage` — таблица броней конкретного ресторана (`GET /api/v1/bookings/restaurant/{id}`), кнопки действий строятся динамически по разрешённым переходам статуса — зеркалит `BookingStatus.canTransitionTo()` бэкенда (PENDING → CONFIRMED/REJECTED/CANCELLED; CONFIRMED → COMPLETED/CANCELLED/NO_SHOW; остальные статусы терминальны, без действий)
- Ссылка «Bookings» на каждой строке в списке ресторанов
- Проверено вживую через headless Chrome на реальном бэкенде: полный цикл PENDING → Confirm (кнопка) → CONFIRMED → Mark completed → COMPLETED, статус и доступные кнопки в таблице обновляются корректно после каждого перехода

### Added — Auth + CRUD ресторанов (первый срез)
- React 19 + Vite + TypeScript, обычный Tailwind без UI-кита (осознанный выбор — минимум зависимостей для admin-панели)
- `api/client.ts` — fetch-обёртка с JWT в `Authorization`, прозрачный silent-refresh на `401` (с защитой от гонки: параллельные запросы, поймавшие 401 одновременно, используют один и тот же in-flight refresh, а не долбят `/auth/refresh` каждый по отдельности)
- Онбординг компании при первом входе — без неё нельзя создать ресторан (`CreateRestaurantRequest.companyId` обязателен), поэтому `RestaurantsListPage` показывает форму создания компании вместо пустого списка, если у пользователя ещё нет ни одной
- CRUD ресторанов: список (`/restaurants`), создание (`/restaurants/new`), редактирование (`/restaurants/:id/edit`, partial update). Удаления нет — бэкенд управляет жизненным циклом ресторана через статус модерации, а не hard delete
- Dev-сервер на порту 3000 — уже был заранее разрешён в CORS-конфиге бэкенда
- Проверено вживую через headless Chrome (Playwright, использовался только для проверки, потом убран из зависимостей — не тестовый фреймворк проекта, а разовый инструмент): register → редирект на /login → login → онбординг компании → создание ресторана → появление в списке → редактирование → персист изменений → logout

### Fixed — недостающий `PATCH /api/v1/restaurants/{id}` и IDOR в бронях бэкенда
- При подготовке CRUD-формы редактирования обнаружено, что у бэкенда были Create/List/Get для ресторанов, но не было Update — добавлено в отдельном репозитории (`KeepBooking`, см. его `CHANGELOG.md`)
- При подготовке страницы управления бронями обнаружена IDOR-уязвимость: менеджер с ролью где угодно мог смотреть/менять брони чужого ресторана — не стал строить UI поверх сломанной авторизационной границы, сначала закрыл дыру в `KeepBooking` (см. его `CHANGELOG.md` за ту же дату)
