import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Error404.scss"; // Asegúrate de tener configurado Sass en tu proyecto

const Error404 = () => {
  const navigate = useNavigate();
  const titleRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    // Efecto "Light"
    const handleDocumentMouseMove = (e) => {
      const x = e.pageX - window.innerWidth / 2;
      const y = e.pageY - window.innerHeight / 2;
      title.style.setProperty('--x', x + 'px');
      title.style.setProperty('--y', y + 'px');
    };

    // Efecto "Shadow"
    const handleTitleMouseMove = (e) => {
      const x = e.pageX - window.innerWidth / 2;
      const y = e.pageY - window.innerHeight / 2;
      const rad = Math.atan2(y, x).toFixed(2);
      const length = Math.round(Math.sqrt(x * x + y * y) / 10);
      const x_shadow = Math.round(length * Math.cos(rad));
      const y_shadow = Math.round(length * Math.sin(rad));
      title.style.setProperty('--x-shadow', -x_shadow + 'px');
      title.style.setProperty('--y-shadow', -y_shadow + 'px');
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    title.addEventListener('mousemove', handleTitleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      title.removeEventListener('mousemove', handleTitleMouseMove);
    };
  }, []);

  return (
    <section className="error_section">
      <p className="error_section_subtitle">Gracias. ¡Acabas de romperlo todo!</p>
      <h1 className="error_title" ref={titleRef}>
        <p>404</p>
        404
      </h1>
      <button className="btn" onClick={() => navigate("/")}>Volver al inicio</button>
    </section>
  );
};

export default Error404;
