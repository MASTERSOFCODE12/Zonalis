// === CONFIGURACIÓN SUPABASE ===
const SUPABASE_URL = 'https://jrydgapzohboqezmfwoz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IhTGDybes15FyZ7GPvYeVA_ceyKR-U4'; 
let supabaseClient = null;
let currentUser = null;

function initSupabase() {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    setupAuthAndFavorites();
  }
}

// Inyectar estilos para el modal de Login y el panel de Favoritos
function injectStylesAndModals() {
  const styles = `
    /* Modal Login */
    .zonalis-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999; opacity: 0; pointer-events: none; transition: 0.25s ease;
    }
    .zonalis-overlay.active { opacity: 1; pointer-events: all; }
    .zonalis-modal {
      background: #fff; width: 90%; max-width: 400px; border-radius: 12px;
      padding: 26px; position: relative; font-family: inherit;
    }
    .zonalis-close { position: absolute; top: 12px; right: 14px; border: none; background: none; font-size: 22px; cursor: pointer; color: #888; }
    .zonalis-tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 18px; }
    .zonalis-tab { flex: 1; padding: 10px; background: none; border: none; font-weight: 600; color: #777; cursor: pointer; border-bottom: 2px solid transparent; }
    .zonalis-tab.active { color: #e04b2b; border-color: #e04b2b; }
    .zonalis-field { margin-bottom: 14px; }
    .zonalis-field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; }
    .zonalis-field input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; }
    .zonalis-btn-submit { width: 100%; padding: 12px; background: #e04b2b; color: #fff; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; }
    
    /* Estado cuando un comercio está guardado */
    #btnFavorito.is-saved {
      background: #ffebeb !important;
      border-color: #e04b2b !important;
      color: #e04b2b !important;
    }
    #btnFavorito.is-saved svg { fill: #e04b2b; }

    /* Enlace de Favoritos en el Header */
    .header__link-favoritos {
      display: inline-flex; align-items: center; gap: 4px; font-weight: 600; cursor: pointer;
    }

    /* Panel desplegable de Favoritos */
    .fav-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #eee; }
    .fav-item img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .fav-item-info { flex: 1; }
    .fav-item-info h4 { margin: 0 0 4px 0; font-size: 15px; }
    .fav-item-info a { font-size: 13px; color: #e04b2b; text-decoration: none; font-weight: 600; }
    .fav-item-del { border: none; background: none; color: #aaa; cursor: pointer; font-size: 18px; padding: 4px; }
    .fav-item-del:hover { color: #e04b2b; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // HTML del Modal de Auth y del Panel de Favoritos
  const modalsHTML = `
    <!-- Modal Login / Registro -->
    <div class="zonalis-overlay" id="authOverlay">
      <div class="zonalis-modal">
        <button class="zonalis-close" id="closeAuth">&times;</button>
        <div class="zonalis-tabs">
          <button class="zonalis-tab active" id="tabLogin">Iniciar Sesión</button>
          <button class="zonalis-tab" id="tabRegister">Registrarse</button>
        </div>
        <form id="authForm">
          <div class="zonalis-field">
            <label>Correo electrónico</label>
            <input type="email" id="authEmail" required placeholder="correo@ejemplo.com">
          </div>
          <div class="zonalis-field">
            <label>Contraseña</label>
            <input type="password" id="authPassword" required placeholder="Mínimo 6 caracteres">
          </div>
          <button type="submit" class="zonalis-btn-submit" id="authSubmit">Entrar</button>
          <p id="authMsg" style="font-size:13px; margin-top:10px; text-align:center;"></p>
        </form>
      </div>
    </div>

    <!-- Modal Lista de Favoritos -->
    <div class="zonalis-overlay" id="favsOverlay">
      <div class="zonalis-modal" style="max-width: 480px; max-height: 80vh; overflow-y: auto;">
        <button class="zonalis-close" id="closeFavs">&times;</button>
        <h3 style="margin-top:0; color:#333;">Mis Comercios Guardados</h3>
        <div id="favsListContent">
          <p style="color:#777; font-size:14px;">Cargando favoritos...</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalsHTML);
  bindEvents();
}

let isLoginMode = true;

function bindEvents() {
  const authOverlay = document.getElementById('authOverlay');
  const favsOverlay = document.getElementById('favsOverlay');

  document.getElementById('closeAuth').onclick = () => authOverlay.classList.remove('active');
  document.getElementById('closeFavs').onclick = () => favsOverlay.classList.remove('active');

  authOverlay.onclick = (e) => { if (e.target === authOverlay) authOverlay.classList.remove('active'); };
  favsOverlay.onclick = (e) => { if (e.target === favsOverlay) favsOverlay.classList.remove('active'); };

  // Pestañas
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const authSubmit = document.getElementById('authSubmit');
  const authMsg = document.getElementById('authMsg');

  tabLogin.onclick = () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authSubmit.textContent = 'Entrar';
    authMsg.textContent = '';
  };
  tabRegister.onclick = () => {
    isLoginMode = false;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    authSubmit.textContent = 'Crear cuenta';
    authMsg.textContent = '';
  };

  // Enviar formulario
  document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;

    authSubmit.disabled = true;
    authMsg.style.color = '#333';
    authMsg.textContent = 'Verificando...';

    try {
      if (isLoginMode) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        authMsg.style.color = 'green';
        authMsg.textContent = '¡Sesión iniciada!';
        setTimeout(() => location.reload(), 500);
      } else {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        authMsg.style.color = 'green';
        authMsg.textContent = 'Cuenta creada con éxito.';
        setTimeout(() => location.reload(), 500);
      }
    } catch (err) {
      authMsg.style.color = '#e04b2b';
      authMsg.textContent = err.message || 'Error de autenticación';
    } finally {
      authSubmit.disabled = false;
    }
  };

  // Botón del Header para abrir Favoritos
  const btnAbrirFavs = document.getElementById('btnAbrirFavoritos');
  if (btnAbrirFavs) {
    btnAbrirFavs.onclick = (e) => {
      e.preventDefault();
      if (!currentUser) {
        authOverlay.classList.add('active');
      } else {
        cargarListaFavoritos();
        favsOverlay.classList.add('active');
      }
    };
  }
}

// Comprobar sesión y actualizar botones
async function setupAuthAndFavorites() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session ? session.user : null;

  const headerBoton = document.querySelector('.header__boton');

  if (currentUser) {
    const userDisplay = currentUser.email.split('@')[0];
    if (headerBoton) {
      headerBoton.textContent = `Hola, ${userDisplay} (Salir)`;
      headerBoton.href = '#logout';
      headerBoton.onclick = async (e) => {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        location.reload();
      };
    }
    actualizarContadorHeader();
  } else {
    if (headerBoton) {
      headerBoton.onclick = (e) => {
        e.preventDefault();
        document.getElementById('authOverlay').classList.add('active');
      };
    }
  }

  setupBotonComercio();
}

// Contador del Header (número de favoritos)
async function actualizarContadorHeader() {
  const spanCant = document.getElementById('cantFavoritos');
  if (!spanCant || !currentUser) return;

  const { count } = await supabaseClient
    .from('favoritos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', currentUser.id);

  spanCant.textContent = count || 0;
}

// Configurar el botón de guardar en la página del comercio
async function setupBotonComercio() {
  const btnFavorito = document.getElementById('btnFavorito');
  const businessContainer = document.querySelector('[data-zonalis-visita]');
  if (!btnFavorito || !businessContainer) return;

  const slug = businessContainer.getAttribute('data-zonalis-visita');
  const txt = document.getElementById('txtBtnFavorito') || btnFavorito;
  const nameEl = document.querySelector('.zonalis-business__name');
  const logoEl = document.querySelector('.zonalis-business__logo img');

  const nombre = nameEl ? nameEl.textContent.trim() : slug;
  const imagen = logoEl ? logoEl.getAttribute('src') : '';

  // Verificar si ya está guardado
  if (currentUser) {
    const { data } = await supabaseClient
      .from('favoritos')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('slug', slug)
      .maybeSingle();

    if (data) {
      btnFavorito.classList.add('is-saved');
      txt.textContent = 'Guardado';
    }
  }

  // Click en el botón de guardar
  btnFavorito.onclick = async () => {
    if (!currentUser) {
      document.getElementById('authOverlay').classList.add('active');
      return;
    }

    const isSaved = btnFavorito.classList.contains('is-saved');

    if (isSaved) {
      // Quitar de favoritos
      await supabaseClient
        .from('favoritos')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('slug', slug);

      btnFavorito.classList.remove('is-saved');
      txt.textContent = 'Favoritos';
    } else {
      // Guardar en favoritos
      await supabaseClient
        .from('favoritos')
        .insert({
          user_id: currentUser.id,
          slug: slug,
          nombre: nombre,
          imagen: imagen
        });

      btnFavorito.classList.add('is-saved');
      txt.textContent = 'Guardado';
    }
    actualizarContadorHeader();
  };
}

// Cargar la lista dentro del panel de favoritos
async function cargarListaFavoritos() {
  const container = document.getElementById('favsListContent');
  if (!container || !currentUser) return;

  container.innerHTML = '<p style="color:#777; font-size:14px;">Cargando...</p>';

  const { data: lista, error } = await supabaseClient
    .from('favoritos')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error || !lista || lista.length === 0) {
    container.innerHTML = '<p style="color:#777; font-size:14px; text-align:center; padding:20px;">Aún no tienes comercios guardados.</p>';
    return;
  }

  container.innerHTML = lista.map((fav) => `
    <div class="fav-item">
      <img src="${fav.imagen || '../images/tiendastr.png'}" alt="${fav.nombre}">
      <div class="fav-item-info">
        <h4>${fav.nombre}</h4>
        <a href="${fav.slug.includes('.html') ? fav.slug : fav.slug + '.html'}">Ver perfil &rarr;</a>
      </div>
      <button class="fav-item-del" onclick="eliminarFavorito('${fav.slug}')" title="Eliminar">&times;</button>
    </div>
  `).join('');
}

// Eliminar un favorito desde el modal
window.eliminarFavorito = async function(slug) {
  if (!currentUser) return;
  await supabaseClient.from('favoritos').delete().eq('user_id', currentUser.id).eq('slug', slug);
  cargarListaFavoritos();
  actualizarContadorHeader();

  const btnFav = document.getElementById('btnFavorito');
  const businessContainer = document.querySelector('[data-zonalis-visita]');
  if (btnFav && businessContainer && businessContainer.getAttribute('data-zonalis-visita') === slug) {
    btnFav.classList.remove('is-saved');
    const txt = document.getElementById('txtBtnFavorito') || btnFav;
    txt.textContent = 'Favoritos';
  }
};

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
  injectStylesAndModals();

  if (!window.supabase) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = initSupabase;
    document.head.appendChild(s);
  } else {
    initSupabase();
  }
});