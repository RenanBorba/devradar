import React, { useState, useEffect } from 'react';

function DevForm({ onSubmit }) {
  const [github_username, setGithubUsername] = useState('');
  const [techs, setTechs] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    // Posição atual
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Coordenadas da posição no browser
        const { latitude, longitude } = position.coords;

        setLatitude(latitude);
        setLongitude(longitude);
      },
      (err) => {
        console.log(err);
      },
      {
        timeout: 30000
      }
    )
  }, []);

  async function handleSubmit(e) {
    // Previnir com o comportamento padrão
    e.preventDefault();

    await onSubmit({
      github_username,
      techs,
      latitude,
      longitude
    });

    setTechs('');
    setGithubUsername('');
  }

  return (
    <form onSubmit={ handleSubmit }>
      <div className="input-block">
        <label htmlFor="github_username">
          Usuário do Github
        </label>
        <input
          name="github_username"
          id="github_username"
          required
          value={ github_username }
          onChange={e => setGithubUsername(e.target.value)}
        />
      </div>

      <div className="input-block">
        <label htmlFor="techs">
          Tecnologias
        </label>
        <input
          name="techs"
          id="techs"
          required
          value={ techs }
          onChange={e => setTechs(e.target.value)}
        />
      </div>

      <div className="input-group">
        <div className="input-block">
          <label htmlFor="latitude">
            Latitude
          </label>
          <input
            type="number"
            name="latitude"
            id="latitude"
            required
            value={ latitude }
            // Armazenar valor do input
            onChange={e => setLatitude(e.target.value)}
          />
        </div>

        <div className="input-block">
          <label htmlFor="longitude">
            Longitude
          </label>
          <input
            type="number"
            name="longitude"
            id="longitude"
            required
            value={ longitude }
            onChange={e => setLongitude(e.target.value)}
          />
        </div>
      </div>

      <button type="submit">Salvar</button>
    </form>
  );
};

export default DevForm;