"use client";
import { useState } from "react";
import Image from "next/image";
import Scene from "../components/Scene";
import { profile, experience, education } from "../data";

export default function Home() {
  const [active, setActive] = useState(0);
  const hot = (i) => ({
    onMouseEnter: () => setActive(i),
    onFocus: () => setActive(i),
  });

  return (
    <main className="layout">
      <Scene count={experience.length} active={active} />

      <div className="content">
        <header className="hero">
          <Image className="avatar" src="/avatar.jpg" alt="Portrait of Eric Wong" width={160} height={160} priority />
          <h1>{profile.name}</h1>
          <p className="role">{profile.title}, {profile.location}</p>
          <p className="intro">{profile.intro}</p>
        </header>

        <section aria-labelledby="exp">
          <h2 id="exp">Experience</h2>
          <ol className="jobs">
            {experience.map((j, i) => (
              <li key={j.company} className={active === i ? "on" : ""} tabIndex={0} {...hot(i)}>
                <div className="row">
                  <h3>{j.company}</h3>
                  <span className="dates">{j.dates}</span>
                </div>
                <p className="meta">{j.role}, {j.place}</p>
                <p>{j.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="edu">
          <h2 id="edu">Education</h2>
          <div className="row">
            <h3>{education.school}</h3>
            <span className="dates">{education.dates}</span>
          </div>
          <p className="meta">{education.degree}</p>
          <p>{education.focus}</p>
        </section>

        <section aria-labelledby="contact">
          <h2 id="contact">Contact</h2>
          <ul className="links">
            <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
            <li><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href={profile.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></li>
            <li><a href={profile.telegram} target="_blank" rel="noreferrer">Telegram</a></li>
            <li><a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}>{profile.phone}</a></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
