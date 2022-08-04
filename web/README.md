<div align="center">

## Rocketseat - Semana OmniStack 10.0
# Projeto - Aplicação DevRADAR Web ReactJS

</div>

<br>

<div align="center">

[![Generic badge](https://img.shields.io/badge/Made%20by-Renan%20Borba-purple.svg)](https://shields.io/) [![Build Status](https://img.shields.io/github/stars/RenanBorba/devradar.svg)](https://github.com/RenanBorba/devradar) [![Build Status](https://img.shields.io/github/forks/RenanBorba/devradar.svg)](https://github.com/RenanBorba/devradar) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

</div>

<br>

Aplicação Front-end desenvolvida em ReactJS para a versão web responsiva DevRADAR, voltada para cadastro (web) e busca de devs de acordo com as tecnologias filtradas no raio de até 10km, permitindo, assim, a atualização em tempo real na versão mobile (mobile) via WebSocket.

<br><br>

<div align="center">

![000](https://user-images.githubusercontent.com/48495838/80157950-b8805800-859d-11ea-86c6-0273f2a617da.jpg)

</div>

<br><br>


## :rocket: Tecnologias
<ul>
  <li>Components</li>
  <li>Services API</li>
  <li>Axios</li>
  <li>Navigator Geolocation</li>
  <li>useState</li>
  <li>useEffect</li>
  <li>CSS</li>
  <li>Fonts</li>
</ul>

<br><br>

## :arrow_forward: Start
<ul>
  <li>npm install</li>
  <li>npm run start / npm start</li>
</ul>

<br><br><br>

## :mega: ⬇ Abaixo, as principais estruturas e interface principal:

<br><br><br>

## src/App.js
```js
import React, { useState, useEffect } from 'react';
import api from './services/api';

import './global.css';
import './App.css';
import './Sidebar.css';
import './Main.css';
import DevItem from './components/DevItem';
import DevForm from './components/DevForm';

function App() {
  const [devs, setDevs] = useState([]);

  useEffect(() => {
    async function loadDevs() {
      const response = await api.get('/devs');

      setDevs(response.data);
    }

    loadDevs();
  }, []);

  async function handleAddDev(data) {
    const response = await api.post('/devs', data);

    setDevs([...devs, response.data]);
  }

  return (
    <div id="app">
      {/* Sidebar */}
      <aside>
        <strong>Cadastrar</strong>
        {/* data prop */}
        <DevForm onSubmit={ handleAddDev } />
      </aside>

      {/* Conteúdo principal (Cards) */}
      <main>
        <ul>
          { devs.map(dev => (
            // dev prop e chave ident. no primeiro elemento no map
            <DevItem key={ dev._id } dev={dev}/>
          ))}
        </ul>

      </main>
    </div>
  );
};

export default App;
```

<br><br>

## src/Main.css
```css
main {
  flex: 1
}

main ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  list-style: none
}

@media (max-width: 650px) {
  main ul {
    grid-template-columns: 1fr
  }
}
```

<br><br>

## src/Sidebar.css
```css
aside {
  width: 320px;
  background: #FFF;
  box-shadow: 0 0 14px 0 rgba(0,0,0,0.02);
  border-radius: 2px;
  padding: 30px 20px
}

aside strong {
  font-size: 20px;
  text-align: center;
  display: block;
  color: #333
}

aside form {
  margin-top: 30px
}

aside form .input-block + .input-block {
  margin-top: 20px
}

aside form .input-group {
  margin-top: 20px;
  display: grid;
  gap: 20px;
  /* Cada coluna ocupa 50% */
  grid-template-columns: 1fr 1fr
}

aside form .input-group .input-block {
  /* Sobrescrever margin */
  margin-top: 0
}

aside form .input-block label {
  color: rgb(159, 159, 159);
  font-size: 14px;
  font-weight: bold;
  display: block
}

aside form .input-block input {
  width: 100%;
  height: 32px;
  font-size: 14px;
  color: #666;
  border: 0;
  border-bottom: 1px solid #DCC
}

aside form .input-block input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none
}

aside form .input-block input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield
}

aside form button[type=submit] {
  width: 100%;
  border: 0;
  margin-top: 30px;
  background:  #3B5BFB;
  border-radius: 2px;
  padding: 15px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #FFF;
  cursor: pointer;
  transition: background 0.5s
}

aside form button[type=submit]:hover {
  background: rgb(20, 65, 250)
}
```


<br><br>


## src/services/api.js
```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333'
});

export default api;
```

<br><br>

## src/components/DevForm/index.js
```js
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
```

<br><br>

## src/components/DevItem/index.js
```js
import React from 'react';

import './styles.css';

function DevItem({ dev }) {
  return (
    <li className="dev-item">
      <header>
        <img
          src={ dev.avatar_url }
          alt={ dev.name }
        />
        <div className="user-info">
          <strong>{ dev.name }</strong>
          <span>{ dev.techs.join(', ')}</span>
        </div>
      </header>
      <p>{ dev.bio }</p>
      <a href={`https://github.com/${dev.github_username}`}>
      Acessar perfil no Github
      </a>
    </li>
  );
};

export default DevItem;
```

<br><br>

## Interface principal
![01](https://user-images.githubusercontent.com/48495838/76792662-43ea1a80-67a2-11ea-997e-c84946a5f31f.PNG)
<br><br>

![02](https://user-images.githubusercontent.com/48495838/76792661-42205700-67a2-11ea-999a-9605bc6bbb71.PNG)
<br><br><br>

## Cadastrando o Dev

![03](https://user-images.githubusercontent.com/48495838/76792693-55332700-67a2-11ea-8d2b-6a0cdda95400.PNG)
<br><br><br>

## Interface após o cadastro do desenvolvedor

![04](https://user-images.githubusercontent.com/48495838/76792695-55cbbd80-67a2-11ea-9765-29e2d7402d24.PNG)
