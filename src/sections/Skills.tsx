import { skills } from '../content/site';

/**
 * Skills: the one marquee on the page runs every tool once, then the same tools
 * grouped by job. Only tools that appear in public code on the GitHub profile.
 */
export function Skills() {
  const all = skills.flatMap((g) => g.items);
  return (
    <section id="skills" className="skills" aria-labelledby="skills-title">
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((k) => (
            <span key={k} className="marquee__run">
              {all.map((t, i) => <span key={`${k}-${t}`} className={i % 2 ? 'is-outline' : ''}>{t}</span>)}
            </span>
          ))}
        </div>
      </div>
      <div className="wrap">
        <h2 id="skills-title" className="skills__title">
          What I build <em>with</em>
        </h2>
        <p className="skills__intro">Only tools that appear in public code on my GitHub, grouped by job.</p>
        <div className="skills__grid">
          {skills.map((g) => (
            <div key={g.group} className="skills__group">
              <h3>{g.group}</h3>
              <ul>{g.items.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
