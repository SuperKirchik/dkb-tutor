import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          Репетитор Онлайн
        </Link>
        <nav className="public-nav" aria-label="Навигация">
          <a href="#advantages">Преимущества</a>
          <a href="#request">Заявка</a>
          <Link className="nav-button" href="/login">
            Войти
          </Link>
        </nav>
      </header>

      <main className="page-main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Минималистичная платформа</p>
            <h1>Уроки, домашки и оплаты без лишнего шума</h1>
            <p>Личный кабинет для репетитора и учеников: расписание, ссылки на уроки, задания, решения и ручной контроль оплат.</p>
            <div className="hero-actions">
              <Link className="button primary" href="/login">
                Войти в кабинет
              </Link>
              <a className="button ghost" href="#request">
                Оставить заявку
              </a>
            </div>
          </div>
          <Image alt="Рабочий стол для онлайн-занятий" height={900} priority src="/study-dashboard.png" width={1400} />
        </section>

        <section className="content-band">
          <div>
            <p className="eyebrow">О репетиторе</p>
            <h2>Понятная система занятий для ученика и родителя</h2>
          </div>
          <p>Каждый ученик видит только свои уроки, задания и статус оплаты. Репетитор управляет расписанием, ссылками и проверкой решений из простой админ-панели.</p>
        </section>

        <section className="feature-grid" id="advantages" aria-label="Преимущества">
          <article>
            <span className="feature-icon">📅</span>
            <h3>Расписание</h3>
            <p>Дата, время, предмет и статус урока всегда перед глазами.</p>
          </article>
          <article>
            <span className="feature-icon">↗</span>
            <h3>Ссылки</h3>
            <p>Zoom, Google Meet, Miro или Excalidraw открываются со страницы урока.</p>
          </article>
          <article>
            <span className="feature-icon">✓</span>
            <h3>Домашки</h3>
            <p>Ученик отправляет текст или файл, преподаватель оставляет комментарий.</p>
          </article>
          <article>
            <span className="feature-icon">₽</span>
            <h3>Оплаты</h3>
            <p>Администратор вручную отмечает оплату: оплачено, ожидает или просрочено.</p>
          </article>
        </section>

        <section className="request-layout" id="request">
          <div>
            <p className="eyebrow">Заявка</p>
            <h2>Записаться на пробный урок</h2>
            <p>Форма пока демонстрационная. В рабочей версии она будет отправлять заявку репетитору.</p>
          </div>
          <form className="form-card">
            <label>
              Имя
              <input placeholder="Анна" type="text" />
            </label>
            <label>
              Email
              <input placeholder="anna@mail.ru" type="email" />
            </label>
            <label>
              Предмет
              <select defaultValue="Математика">
                <option>Математика</option>
                <option>Английский</option>
                <option>Русский язык</option>
              </select>
            </label>
            <button className="button primary" type="button">
              Отправить заявку
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
