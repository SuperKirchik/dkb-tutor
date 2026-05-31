import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          Кабинет репетитора
        </Link>
        <nav className="public-nav" aria-label="Навигация">
          <Link className="nav-button" href="/login">
            Войти
          </Link>
        </nav>
      </header>

      <main className="page-main">
        <section className="workspace-home">
          <div className="workspace-intro">
            <article className="panel">
              <p className="eyebrow">Рабочее пространство</p>
              <h1>Расписание, домашние задания, материалы и прогресс в одном месте</h1>
              <p>
                Здесь ученик быстро открывает ближайшее занятие, видит домашку и материалы, а репетитор управляет
                уроками, оплатами и результатами без лишних разделов.
              </p>
            </article>

            <section className="feature-grid" aria-label="Основные разделы">
              <article>
                <span className="feature-icon">01</span>
                <h3>Расписание</h3>
                <p>Дата, время, предмет, ссылка на урок и доска для занятия.</p>
              </article>
              <article>
                <span className="feature-icon">02</span>
                <h3>Домашка</h3>
                <p>Задания, материалы урока, файлы и ответ ученика.</p>
              </article>
              <article>
                <span className="feature-icon">03</span>
                <h3>Прогресс</h3>
                <p>Оценки за работу на уроке и домашнее задание.</p>
              </article>
              <article>
                <span className="feature-icon">04</span>
                <h3>Оплаты</h3>
                <p>Статус оплаты по каждому отдельному занятию.</p>
              </article>
            </section>
          </div>

          <aside className="panel">
            <p className="eyebrow">Что открыть сейчас</p>
            <h2>Вход в кабинет</h2>
            <p>Используйте аккаунт ученика или администратора. После входа откроется рабочая панель с нужными действиями.</p>
            <div className="workspace-actions">
              <Link className="button primary" href="/login">
                Перейти ко входу
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
