import useAboutPage from '../hooks/useAboutPage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const About = () => {
  const { data, loading, error } = useAboutPage();

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  const { about, education, experience, projects, skills } = data;

  return (
    <div className="about-page">
      {/* Display error message if there was an error, but still show content */}
      {error && <ErrorMessage message={error} />}

      <header className="page-header">
        <div className="profile-intro">
          {about.profileImage && (
            <img src={about.profileImage} alt={about.name} className="profile-image" />
          )}
          <div className="profile-text">
            <h1 className="page-title">{about.name}</h1>
            {about.currentRole && <p className="current-role">{about.currentRole}</p>}
            {about.tagline && <p className="tagline">{about.tagline}</p>}
          </div>
        </div>

        <div className="contact-header">
          {about.location && <p className="location">📍 {about.location}</p>}
          <div className="contact-links">
            {about.phone && (
              <a href={`tel:${about.phone}`} className="contact-link">
                ☎️ {about.phone}
              </a>
            )}
            {about.email && (
              <a href={`mailto:${about.email}`} className="contact-link">
                ✉️ {about.email}
              </a>
            )}
            {about.resumeFile && (
              <a href={about.resumeFile} className="contact-link" target="_blank" rel="noopener noreferrer">
                📄 Resume
              </a>
            )}
            {about.socialLinks && about.socialLinks.length > 0 && (
              <div className="social-links">
                {about.socialLinks.map((link, idx) => (
                  <a key={idx} href={link.url} className="social-link" target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {about.bio && (
        <section className="about-section">
          <h2 className="section-title">About</h2>
          <div className="summary-content">
            <p>{about.bio}</p>
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="about-section">
          <h2 className="section-title">Education</h2>
          <div className="education-list">
            {education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="education-header">
                  {edu.institutionLogo && (
                    <img src={edu.institutionLogo} alt={edu.institution} className="institution-logo" />
                  )}
                  <div className="education-content">
                    <h3 className="degree">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <div className="education-meta">
                      <span className="institution">{edu.institution}</span>
                      {edu.location && <span className="location">{edu.location}</span>}
                    </div>
                    <div className="education-details">
                      {edu.gpa && <span className="gpa">GPA: {edu.gpa}</span>}
                      {edu.startDate && edu.endDate && (
                        <span className="dates">{edu.startDate} – {edu.endDate}</span>
                      )}
                    </div>
                  </div>
                </div>
                {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                  <div className="coursework">
                    <strong>📚 Relevant Coursework:</strong>
                    <ul>
                      {edu.relevantCoursework.map((course, idx) => {
                        const courseName = typeof course === 'string' ? course : course.name || '';
                        return courseName ? <li key={idx}>{courseName}</li> : null;
                      })}
                    </ul>
                  </div>
                )}
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="achievements">
                    {edu.achievements.map((achievement, idx) => {
                      const text = typeof achievement === 'string' ? achievement : achievement.description || '';
                      return text ? <li key={idx}>✓ {text}</li> : null;
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="about-section">
          <h2 className="section-title">Work Experience</h2>
          <div className="experience-timeline">
            {experience.map((job, index) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  {job.companyLogo && (
                    <img src={job.companyLogo} alt={job.company} className="company-logo" />
                  )}
                  <div className="job-content">
                    <h3 className="job-title">{job.role}</h3>
                    <div className="job-meta">
                      <span className="company">{job.company}</span>
                      {job.employmentType && <span className="employment-type">{job.employmentType}</span>}
                      {job.location && <span className="location">{job.location}</span>}
                    </div>
                    <span className="period">{job.period}</span>
                  </div>
                </div>
                {job.description && <p className="job-description">{job.description}</p>}
                {job.technologies && job.technologies.length > 0 && (
                  <div className="technologies">
                    <strong>Technologies:</strong>
                    <div className="tech-list">
                      {job.technologies.map((tech, techIdx) => (
                        <span key={techIdx} className="tech-badge">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                {job.achievements && job.achievements.length > 0 && (
                  <ul className="job-achievements">
                    {job.achievements.map((achievement, achIndex) => {
                      const text = typeof achievement === 'string' ? achievement : achievement.description || '';
                      return text ? <li key={achIndex}>✓ {text}</li> : null;
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && (
        <section className="about-section">
          <h2 className="section-title">Projects</h2>
          <div className="projects-list">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                {project.thumbnail && (
                  <div className="project-thumbnail">
                    <img src={project.thumbnail} alt={project.title} />
                  </div>
                )}
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  {project.category && <span className="project-category">{project.category}</span>}
                  <div className="project-meta">
                    {project.startDate && project.endDate && (
                      <span className="project-dates">{project.startDate} – {project.endDate}</span>
                    )}
                  </div>
                </div>
                {project.shortDescription && (
                  <p className="project-short-description">{project.shortDescription}</p>
                )}
                {project.fullDescription && (
                  <p className="project-description">{project.fullDescription}</p>
                )}
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="project-highlights">
                    {project.highlights.map((highlight, hIdx) => {
                      const text = typeof highlight === 'string' ? highlight : highlight.description || '';
                      return text ? <li key={hIdx}>✓ {text}</li> : null;
                    })}
                  </ul>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-technologies">
                    <strong>Tech Stack:</strong>
                    <div className="tech-tags">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                {project.images && project.images.length > 0 && (
                  <div className="project-gallery">
                    {project.images.map((img, imgIndex) => (
                      <img key={imgIndex} src={img} alt={`${project.title} ${imgIndex + 1}`} />
                    ))}
                  </div>
                )}
                <div className="project-footer">
                  {project.projectUrl && project.projectUrl !== '#' && (
                    <a
                      href={project.projectUrl}
                      className="project-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Live →
                    </a>
                  )}
                  {project.githubUrl && project.githubUrl !== '#' && (
                    <a
                      href={project.githubUrl}
                      className="project-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Code →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && Object.keys(skills).length > 0 && (
        <section className="about-section">
          <h2 className="section-title">Technical Skills</h2>
          <div className="skills-grid">
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category} className="skill-category">
                <h3 className="skill-category-title">{category}</h3>
                <div className="skill-items">
                  {skillList.map((skill, skillIndex) => (
                    <div key={skillIndex} className="skill-item">
                      <span className="skill-name">{skill.name}</span>
                      {skill.proficiencyLevel && (
                        <span className={`proficiency-badge proficiency-${skill.proficiencyLevel.toLowerCase()}`}>
                          {skill.proficiencyLevel}
                        </span>
                      )}
                      {skill.yearsOfExperience > 0 && (
                        <span className="years-badge">{skill.yearsOfExperience}y</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default About;