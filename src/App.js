import React, { useState, useEffect } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8U78q9OabXopXBP2_TNu0AqMgi63v4sw",
  authDomain: "app-club95.firebaseapp.com",
  projectId: "app-club95",
  storageBucket: "app-club95.firebasestorage.app",
  messagingSenderId: "866738204928",
  appId: "1:866738204928:web:0caaca11ff134bf4ab43e5"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─── THEME ───────────────────────────────────────────────────────
const T = {
  primary: '#F03D00', bg: '#0A0A0A', surface: '#1A1A1A',
  border: '#2A2A2A', text: '#FFFFFF', muted: '#6B6460',
  green: '#22C55E', surfaceAlt: '#242424',
  gold: '#D4A017', silver: '#C0C0C0',
};

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const COMERCIOS = [
  { id: '1', nombre: 'FitZone Gym', categoria: 'Salud', emoji: '💪', descuentoBlack: 20, descuentoGold: 15, dias: ['Lun', 'Mié', 'Vie'], planes: ['black', 'gold'], direccion: 'Av. Siempre Viva 123', tel: '2954-123456' },
  { id: '2', nombre: 'Café Negro', categoria: 'Gastronomía', emoji: '☕', descuentoBlack: 15, descuentoGold: 10, dias: ['Mar', 'Jue', 'Sáb'], planes: ['black', 'gold'], direccion: 'San Martín 456', tel: '2954-234567' },
  { id: '3', nombre: 'StyleStore', categoria: 'Ropa', emoji: '👔', descuentoBlack: 25, descuentoGold: 20, dias: ['Lun', 'Sáb'], planes: ['black', 'gold'], direccion: 'Pellegrini 789', tel: '2954-345678' },
  { id: '4', nombre: 'AutoLav Express', categoria: 'Automotor', emoji: '🚗', descuentoBlack: 30, descuentoGold: null, dias: ['Mié', 'Sáb'], planes: ['black'], direccion: 'Ruta 35 km 2', tel: '2954-456789' },
  { id: '5', nombre: 'Farmacia Vital', categoria: 'Salud', emoji: '💊', descuentoBlack: 10, descuentoGold: null, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], planes: ['black'], direccion: 'Av. Uruguay 321', tel: '2954-567890' },
  { id: '6', nombre: 'Pizza Bros', categoria: 'Gastronomía', emoji: '🍕', descuentoBlack: 20, descuentoGold: 15, dias: ['Jue', 'Vie', 'Sáb', 'Dom'], planes: ['black', 'gold'], direccion: 'Italia 654', tel: '2954-678901' },
  { id: '7', nombre: 'Barbería Central', categoria: 'Servicios', emoji: '✂️', descuentoBlack: 15, descuentoGold: 15, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], planes: ['black', 'gold'], direccion: 'Mitre 987', tel: '2954-789012' },
];

const USERS = {
  'uid_carlos': { uid: 'uid_carlos', email: 'carlos@mail.com', password: '123456', displayName: 'Carlos Méndez', plan: 'gold', totalSaved: 12450, cortesRestantes: 1, cortesTotales: 2, vencimiento: '30 Abr 2025' },
  'uid_martin': { uid: 'uid_martin', email: 'martin@mail.com', password: '123456', displayName: 'Martín López', plan: 'black', totalSaved: 4320, cortesRestantes: 0, cortesTotales: 1, vencimiento: '15 May 2025' },
};

const TRANSACTIONS = [
  { id: 'tx1', userId: 'uid_carlos', merchantName: 'FitZone Gym', amount: 8000, discount: 15, saved: 1200, date: '15 Mar 2025' },
  { id: 'tx2', userId: 'uid_carlos', merchantName: 'Café Negro', amount: 2500, discount: 10, saved: 250, date: '24 Mar 2025' },
  { id: 'tx3', userId: 'uid_carlos', merchantName: 'Barbería Central', amount: 1500, discount: 15, saved: 225, date: '10 Mar 2025' },
  { id: 'tx4', userId: 'uid_martin', merchantName: 'StyleStore', amount: 5000, discount: 25, saved: 1250, date: '20 Mar 2025' },
  { id: 'tx5', userId: 'uid_martin', merchantName: 'Pizza Bros', amount: 3000, discount: 20, saved: 600, date: '22 Mar 2025' },
];

const PLAN_CONFIG = {
  black: { label: '⬛ Black', color: '#C0C0C0', bg: '#2a2a2a', cortes: 1 },
  gold: { label: '🥇 Gold', color: '#D4A017', bg: '#B8860B', cortes: 2 },
};

const styles = {
  root: { minHeight: '100vh', backgroundColor: T.bg, color: T.text, fontFamily: "'Segoe UI', sans-serif", maxWidth: 430, margin: '0 auto', position: 'relative' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 28 },
  logo: { fontSize: 48, fontWeight: 900, color: T.text, marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: T.muted, marginBottom: 40, textAlign: 'center' },
  input: { width: '100%', backgroundColor: T.surface, borderRadius: 12, padding: 14, marginBottom: 12, color: T.text, fontSize: 15, border: `1px solid ${T.border}`, outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', backgroundColor: T.primary, borderRadius: 12, padding: 14, color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer' },
  btnGhost: { width: '100%', backgroundColor: 'transparent', borderRadius: 12, padding: 14, color: T.muted, fontWeight: 800, fontSize: 15, border: `1px solid ${T.border}`, cursor: 'pointer', marginTop: 12 },
  card: { margin: 16, borderRadius: 20, padding: 24 },
  row: { display: 'flex', alignItems: 'center', backgroundColor: T.surface, marginBottom: 8, borderRadius: 12, padding: 14 },
  tabBar: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, display: 'flex', backgroundColor: T.surface, borderTop: `1px solid ${T.border}`, paddingBottom: 8 },
  tabItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 0', cursor: 'pointer', background: 'none', border: 'none' },
  tabLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: T.text, padding: '10px 20px', textTransform: 'uppercase', letterSpacing: 0.8 },
  comercioCard: { backgroundColor: T.surface, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${T.border}`, cursor: 'pointer' },
  infoCard: { backgroundColor: T.surface, borderRadius: 14, padding: 16, marginBottom: 10, border: `1px solid ${T.border}` },
  pill: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, cursor: 'pointer', marginRight: 6, marginBottom: 6 },
  dayPill: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, marginRight: 4, marginBottom: 4 },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modalBox: { backgroundColor: T.surface, borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 430, maxHeight: '90vh', overflowY: 'auto' },
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('carlos@mail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [filterCat, setFilter] = useState('Todos');
  const [selectedComercio, setSelectedComercio] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [notifShown, setNotifShown] = useState(false);
  const [transactions] = useState(TRANSACTIONS);

  const myTx = transactions.filter(t => t.userId === user?.uid);
  const totalSaved = myTx.reduce((s, t) => s + t.saved, 0);
  const plan = user ? PLAN_CONFIG[user.plan] : PLAN_CONFIG.black;

  const hoyIndex = new Date().getDay();
  const hoy = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][hoyIndex];

  const misComercio = COMERCIOS.filter(c => c.planes.includes(user?.plan));
  const comerciosHoy = misComercio.filter(c => c.dias.includes(hoy));
  const categorias = ['Todos', ...new Set(misComercio.map(c => c.categoria))];
  const filtered = filterCat === 'Todos' ? misComercio : misComercio.filter(c => c.categoria === filterCat);

  const rankingComercio = [...misComercio].map(c => ({
    ...c,
    totalAhorrado: myTx.filter(t => t.merchantName === c.nombre).reduce((s, t) => s + t.saved, 0),
  })).sort((a, b) => b.totalAhorrado - a.totalAhorrado).filter(c => c.totalAhorrado > 0);

  useEffect(() => {
    if (user && !notifShown && comerciosHoy.length > 0) {
      setTimeout(() => { setShowNotif(true); setNotifShown(true); }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  // ── LOGIN ──
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPlan, setRegPlan] = useState('black');
  const [authScreen, setAuthScreen] = useState('login');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, ...snap.data() });
          setScreen('app');
        }
      }
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    setError('');
    setLoadingAuth(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (snap.exists()) {
        setUser({ uid: cred.user.uid, ...snap.data() });
        setScreen('app');
        setTab('home');
      }
    } catch (e) {
      setError('Email o contraseña incorrectos');
    }
    setLoadingAuth(false);
  };

  const register = async () => {
    setError('');
    if (!regName.trim() || !regEmail.trim() || regPass.length < 6) {
      setError('Completá todos los campos. Mínimo 6 caracteres.');
      return;
    }
    setLoadingAuth(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPass);
      const userData = {
        uid: cred.user.uid,
        email: regEmail.trim(),
        displayName: regName.trim(),
        plan: regPlan,
        totalSaved: 0,
        cortesRestantes: regPlan === 'gold' ? 2 : 1,
        cortesTotales: regPlan === 'gold' ? 2 : 1,
        vencimiento: '30 Abr 2026',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userData);
      setUser({ uid: cred.user.uid, ...userData });
      setScreen('app');
      setTab('home');
    } catch (e) {
      setError(e.message);
    }
    setLoadingAuth(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setScreen('login');
    setNotifShown(false);
  };

  if (loadingAuth) return (
    <div style={{ ...styles.root, ...styles.center }}>
      <p style={styles.logo}>CLUB<span style={{ color: T.primary }}>95.</span></p>
      <p style={{ color: T.muted, fontSize: 14, marginTop: 16 }}>Cargando...</p>
    </div>
  );

  if (screen === 'login' && authScreen === 'login') return (
    <div style={styles.root}>
      <div style={styles.center}>
        <p style={styles.logo}>CLUB<span style={{ color: T.primary }}>95.</span></p>
        <p style={styles.subtitle}>Barbers & Friends</p>
        <input style={styles.input} placeholder='Email' value={email}
          onChange={e => setEmail(e.target.value)} type='email' />
        <input style={styles.input} placeholder='Contraseña' value={password}
          onChange={e => setPassword(e.target.value)} type='password' />
        {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button style={styles.btn} onClick={login} disabled={loadingAuth}>
          {loadingAuth ? 'Ingresando...' : 'Ingresar'}
        </button>
        <button style={styles.btnGhost} onClick={() => { setAuthScreen('register'); setError(''); }}>
          ¿No tenés cuenta? Registrate
        </button>
      </div>
    </div>
  );

  if (screen === 'login' && authScreen === 'register') return (
    <div style={styles.root}>
      <div style={styles.center}>
        <p style={styles.logo}>CLUB<span style={{ color: T.primary }}>95.</span></p>
        <p style={styles.subtitle}>Crear cuenta</p>
        <input style={styles.input} placeholder='Nombre completo' value={regName}
          onChange={e => setRegName(e.target.value)} />
        <input style={styles.input} placeholder='Email' value={regEmail}
          onChange={e => setRegEmail(e.target.value)} type='email' />
        <input style={styles.input} placeholder='Contraseña (mín. 6 caracteres)' value={regPass}
          onChange={e => setRegPass(e.target.value)} type='password' />

        {/* Selector de plan */}
        <p style={{
          color: T.muted, fontSize: 12, textTransform: 'uppercase',
          letterSpacing: 0.8, marginBottom: 10, alignSelf: 'flex-start'
        }}>Elegí tu plan</p>
        <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 16 }}>
          {[
            { id: 'black', label: '⬛ Black', desc: '1 corte/mes · Todos los comercios', price: '$4.999/mes' },
            { id: 'gold', label: '🥇 Gold', desc: '2 cortes/mes · Comercios seleccionados', price: '$8.999/mes' },
          ].map(p => (
            <div key={p.id} onClick={() => setRegPlan(p.id)} style={{
              flex: 1, padding: 14, borderRadius: 14, cursor: 'pointer',
              backgroundColor: regPlan === p.id ? T.surfaceAlt : T.surface,
              border: `2px solid ${regPlan === p.id ? T.primary : T.border}`,
              textAlign: 'center',
            }}>
              <p style={{ fontWeight: 900, fontSize: 15, margin: 0, marginBottom: 4 }}>{p.label}</p>
              <p style={{ color: T.muted, fontSize: 10, margin: 0, marginBottom: 6 }}>{p.desc}</p>
              <p style={{ color: T.primary, fontWeight: 800, fontSize: 12, margin: 0 }}>{p.price}</p>
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button style={styles.btn} onClick={register} disabled={loadingAuth}>
          {loadingAuth ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <button style={styles.btnGhost} onClick={() => { setAuthScreen('login'); setError(''); }}>
          ¿Ya tenés cuenta? Iniciá sesión
        </button>
      </div>
    </div>
  );
  // ── DETALLE COMERCIO ──
  if (selectedComercio) {
    const c = selectedComercio;
    const descuento = user?.plan === 'gold' ? c.descuentoGold : c.descuentoBlack;
    const disponibleHoy = c.dias.includes(hoy);
    const miAhorro = myTx.filter(t => t.merchantName === c.nombre).reduce((s, t) => s + t.saved, 0);
    return (
      <div style={{ ...styles.root, overflowY: 'auto' }}>
        <div style={{ backgroundColor: T.surface, padding: 20 }}>
          <button onClick={() => setSelectedComercio(null)}
            style={{ background: 'none', border: 'none', color: T.muted, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
            ← Volver
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14, backgroundColor: T.surfaceAlt,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30
            }}>
              {c.emoji}
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 20, margin: 0 }}>{c.nombre}</p>
              <p style={{ color: T.muted, fontSize: 12, margin: 0, marginTop: 2 }}>{c.categoria}</p>
            </div>
          </div>
        </div>

        <div style={{
          margin: 16, borderRadius: 20, padding: 24, textAlign: 'center',
          backgroundColor: disponibleHoy ? T.primary : T.surface
        }}>
          <p style={{
            color: 'rgba(255,255,255,.7)', fontSize: 11, textTransform: 'uppercase',
            letterSpacing: 0.8, margin: 0, marginBottom: 6
          }}>
            {disponibleHoy ? '✓ DISPONIBLE HOY' : 'NO DISPONIBLE HOY'}
          </p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 64, margin: 0, lineHeight: 1 }}>{descuento}%</p>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, margin: 0, marginTop: 4 }}>
            de descuento · Plan {plan.label}
          </p>
        </div>

        <div style={{ padding: '0 16px 100px' }}>
          <div style={styles.infoCard}>
            <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 10 }}>📅 Días disponibles</p>
            <div>{DIAS.map(dia => {
              const activo = c.dias.includes(dia);
              const esHoy = dia === hoy && activo;
              return (
                <span key={dia} style={{
                  ...styles.dayPill,
                  backgroundColor: esHoy ? T.primary : activo ? T.surfaceAlt : 'transparent',
                  border: `1px solid ${esHoy ? T.primary : activo ? T.border : T.border}`,
                  color: esHoy ? '#fff' : activo ? T.text : T.muted
                }}>
                  {dia}
                </span>
              );
            })}</div>
          </div>

          <div style={styles.infoCard}>
            <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 8 }}>📍 Ubicación</p>
            <p style={{ color: T.muted, fontSize: 13, margin: 0, marginBottom: 10 }}>{c.direccion}</p>
            <a href={`https://maps.google.com/?q=${c.direccion}`} target='_blank' rel='noreferrer'
              style={{ color: T.primary, fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              🗺️ Ver en mapa
            </a>
          </div>

          <div style={styles.infoCard}>
            <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 8 }}>📞 Contacto</p>
            <a href={`tel:${c.tel}`} style={{ color: T.green, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              📱 {c.tel}
            </a>
          </div>

          {miAhorro > 0 && (
            <div style={{ ...styles.infoCard, borderColor: 'rgba(34,197,94,.3)' }}>
              <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 6 }}>💰 Mi ahorro aquí</p>
              <p style={{ color: T.green, fontWeight: 900, fontSize: 28, margin: 0 }}>
                ${miAhorro.toLocaleString('es-AR')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── HOME ──
  const HomeTab = () => (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: 20, paddingBottom: 8 }}>
        <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>Hola,</p>
        <p style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{user?.displayName?.split(' ')[0]}</p>
      </div>

      {/* Card */}
      <div style={{ ...styles.card, backgroundColor: plan.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Membresía
          </span>
          <span style={{ color: plan.color, fontWeight: 900, fontSize: 13 }}>{plan.label}</span>
        </div>
        <p style={{
          color: 'rgba(255,255,255,.7)', fontSize: 11, textTransform: 'uppercase',
          letterSpacing: 0.8, margin: 0, marginBottom: 4
        }}>TOTAL AHORRADO</p>
        <p style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>
          ${totalSaved.toLocaleString('es-AR')}
        </p>

        {/* Cortes */}
        <div style={{ marginTop: 14, backgroundColor: 'rgba(0,0,0,.2)', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Cortes este mes
            </span>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>
              {user?.cortesTotales - user?.cortesRestantes}/{user?.cortesTotales}
            </span>
          </div>
          <div style={{ height: 6, backgroundColor: 'rgba(0,0,0,.3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              backgroundColor: user?.cortesRestantes > 0 ? '#fff' : T.green,
              width: `${((user?.cortesTotales - user?.cortesRestantes) / user?.cortesTotales) * 100}%`,
              transition: 'width .4s'
            }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            {Array.from({ length: user?.cortesTotales }).map((_, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: i < (user?.cortesTotales - user?.cortesRestantes)
                  ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
              }}>
                {i < (user?.cortesTotales - user?.cortesRestantes) ? '✂️' : ''}
              </div>
            ))}
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginLeft: 4 }}>
              {user?.cortesRestantes > 0
                ? `${user?.cortesRestantes} disponible${user?.cortesRestantes > 1 ? 's' : ''}`
                : 'Sin cortes disponibles'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>Vence el</span>
          <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, fontWeight: 700 }}>{user?.vencimiento}</span>
        </div>
      </div>

      {/* Comercios hoy */}
      {comerciosHoy.length > 0 && (
        <div>
          <p style={styles.sectionTitle}>🔥 Disponibles hoy</p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 8px', scrollbarWidth: 'none' }}>
            {comerciosHoy.map(c => {
              const desc = user?.plan === 'gold' ? c.descuentoGold : c.descuentoBlack;
              return (
                <div key={c.id} onClick={() => setSelectedComercio(c)}
                  style={{
                    backgroundColor: T.surface, borderRadius: 14, padding: 14,
                    minWidth: 120, cursor: 'pointer', border: `1px solid ${T.primary}44`, flexShrink: 0
                  }}>
                  <p style={{ fontSize: 24, margin: 0, marginBottom: 6 }}>{c.emoji}</p>
                  <p style={{
                    fontWeight: 700, fontSize: 12, margin: 0, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{c.nombre}</p>
                  <p style={{ color: T.primary, fontWeight: 900, fontSize: 20, margin: 0, marginTop: 4 }}>{desc}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranking */}
      {rankingComercio.length > 0 && (
        <div>
          <p style={styles.sectionTitle}>🏆 Tu ranking de ahorro</p>
          {rankingComercio.map((c, i) => (
            <div key={c.id} onClick={() => setSelectedComercio(c)}
              style={{ ...styles.row, marginLeft: 16, marginRight: 16, cursor: 'pointer' }}>
              <span style={{
                color: i === 0 ? T.gold : i === 1 ? T.silver : '#CD7F32',
                fontWeight: 900, fontSize: 16, width: 28
              }}> #{i + 1}</span>
              <span style={{ fontSize: 20, marginRight: 10 }}>{c.emoji}</span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{c.nombre}</span>
              <span style={{ color: T.green, fontWeight: 900, fontSize: 15 }}>
                ${c.totalAhorrado.toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Historial */}
      <p style={styles.sectionTitle}>Últimos descuentos</p>
      {myTx.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 32 }}>🧾</p>
          <p style={{ color: T.muted, fontSize: 14 }}>Sin transacciones aún</p>
        </div>
      ) : myTx.map(item => (
        <div key={item.id} style={{ ...styles.row, marginLeft: 16, marginRight: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, backgroundColor: T.surfaceAlt,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontSize: 18
          }}>
            🏪
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{item.merchantName}</p>
            <p style={{ color: T.muted, fontSize: 11, margin: 0, marginTop: 2 }}>{item.date}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: T.green, fontWeight: 900, fontSize: 16, margin: 0 }}>-${item.saved}</p>
            <p style={{ color: T.muted, fontSize: 11, margin: 0 }}>{item.discount}% off</p>
          </div>
        </div>
      ))}
    </div>
  );

  // ── BENEFICIOS ──
  const BeneficiosTab = () => (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: 20, paddingBottom: 8 }}>
        <p style={{ color: T.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>
          Plan {plan.label}
        </p>
        <p style={{ fontSize: 22, fontWeight: 900, margin: 0, marginTop: 2 }}>Mis Beneficios</p>
        <p style={{ color: T.muted, fontSize: 12, margin: 0, marginTop: 4 }}>
          {misComercio.length} comercios · Hoy: {hoy}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 12px', scrollbarWidth: 'none' }}>
        {categorias.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            ...styles.pill,
            backgroundColor: filterCat === cat ? T.primary : T.surface,
            color: filterCat === cat ? '#fff' : T.muted,
            border: `1px solid ${filterCat === cat ? T.primary : T.border}`,
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {filtered.map(c => {
          const descuento = user?.plan === 'gold' ? c.descuentoGold : c.descuentoBlack;
          const disponibleHoy = c.dias.includes(hoy);
          return (
            <div key={c.id} onClick={() => setSelectedComercio(c)}
              style={{ ...styles.comercioCard, opacity: disponibleHoy ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, backgroundColor: T.surfaceAlt,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginRight: 12
                }}>
                  {c.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, margin: 0 }}>{c.nombre}</p>
                  <p style={{ color: T.muted, fontSize: 11, margin: 0, marginTop: 2 }}>{c.categoria}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: T.primary, fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>{descuento}%</p>
                  <p style={{ color: T.muted, fontSize: 10, margin: 0, textTransform: 'uppercase' }}>off</p>
                </div>
              </div>
              <div>
                {DIAS.map(dia => {
                  const activo = c.dias.includes(dia);
                  const esHoy = dia === hoy && activo;
                  return (
                    <span key={dia} style={{
                      ...styles.dayPill,
                      backgroundColor: esHoy ? T.primary : activo ? T.surfaceAlt : 'transparent',
                      border: `1px solid ${esHoy ? T.primary : activo ? T.border : T.border}`,
                      color: esHoy ? '#fff' : activo ? T.text : T.muted
                    }}>
                      {dia}
                    </span>
                  );
                })}
                {disponibleHoy && (
                  <span style={{
                    ...styles.dayPill,
                    backgroundColor: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)', color: T.green
                  }}>
                    ✓ Hoy
                  </span>
                )}
              </div>
              <p style={{ color: T.muted, fontSize: 11, margin: 0, marginTop: 8 }}>📍 {c.direccion}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── QR ──
  const QRTab = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 28, paddingBottom: 100, minHeight: '80vh'
    }}>
      <p style={{ fontSize: 22, fontWeight: 900, margin: 0, marginBottom: 8 }}>Tu código QR</p>
      <p style={{ color: T.muted, fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
        Mostráselo al comercio para aplicar tu descuento
      </p>
      <div style={{
        padding: 16, backgroundColor: '#fff', borderRadius: 16,
        border: `3px solid ${T.primary}`, boxShadow: `0 0 40px ${T.primary}44`
      }}>
        <QRCode value={user?.uid || 'club95'} size={200} bgColor='#fff' fgColor='#0A0A0A' />
      </div>
      <div style={{
        marginTop: 24, backgroundColor: T.surface, borderRadius: 12,
        padding: 16, width: '100%', textAlign: 'center', border: `1px solid ${T.border}`
      }}>
        <p style={{ color: T.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: 0, marginBottom: 6 }}>
          ID de membresía
        </p>
        <p style={{ color: T.primary, fontWeight: 700, fontSize: 12, margin: 0, wordBreak: 'break-all' }}>
          {user?.uid}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.green }} />
        <span style={{ color: T.green, fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>
          {plan.label} · Activo
        </span>
      </div>
      <p style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>Vence el {user?.vencimiento}</p>
    </div>
  );

  // ── PROFILE ──
  const ProfileTab = () => (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36, backgroundColor: plan.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 12
        }}>
          {user?.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <p style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{user?.displayName}</p>
        <p style={{ color: T.muted, fontSize: 13, margin: 0, marginTop: 2 }}>{user?.email}</p>
        <span style={{
          marginTop: 8, padding: '4px 14px', borderRadius: 20,
          border: `1px solid ${plan.bg}`, color: plan.color, fontWeight: 800, fontSize: 12
        }}>
          {plan.label}
        </span>
      </div>

      {[
        { icon: '💰', label: 'Total ahorrado', value: `$${totalSaved.toLocaleString('es-AR')}` },
        { icon: '🧾', label: 'Transacciones', value: `${myTx.length}` },
        { icon: '✂️', label: 'Cortes disponibles', value: `${user?.cortesRestantes} de ${user?.cortesTotales}` },
        { icon: '📅', label: 'Vencimiento', value: user?.vencimiento },
        { icon: '🏪', label: 'Comercios disponibles', value: `${misComercio.length}` },
      ].map((item, i) => (
        <div key={i} style={{ ...styles.row, marginBottom: 8 }}>
          <span style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</span>
          <span style={{ flex: 1, color: T.muted, fontSize: 13 }}>{item.label}</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{item.value}</span>
        </div>
      ))}

      <button style={styles.btnGhost}
        onClick={() => { setUser(null); setScreen('login'); setNotifShown(false); }}>
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <div style={styles.root}>

      {/* Notificacion */}
      {showNotif && (
        <div style={styles.modal} onClick={() => setShowNotif(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <p style={{ color: T.primary, fontWeight: 900, fontSize: 16, margin: 0, marginBottom: 4 }}>
              🔥 Descuentos disponibles hoy
            </p>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>
              Tenés {comerciosHoy.length} comercio{comerciosHoy.length > 1 ? 's' : ''} con descuento hoy ({hoy})
            </p>
            {comerciosHoy.slice(0, 3).map(c => {
              const desc = user?.plan === 'gold' ? c.descuentoGold : c.descuentoBlack;
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center',
                  marginBottom: 10, gap: 10
                }}>
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{c.nombre}</span>
                  <span style={{ color: T.primary, fontWeight: 900, fontSize: 16 }}>{desc}%</span>
                </div>
              );
            })}
            <button style={{ ...styles.btn, marginTop: 8 }}
              onClick={() => { setShowNotif(false); setTab('beneficios'); }}>
              Ver todos los beneficios
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {tab === 'home' && <HomeTab />}
        {tab === 'beneficios' && <BeneficiosTab />}
        {tab === 'qr' && <QRTab />}
        {tab === 'profile' && <ProfileTab />}
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {[
          { id: 'home', icon: '🏠', label: 'Inicio' },
          { id: 'beneficios', icon: '🏷️', label: 'Beneficios' },
          { id: 'qr', icon: '⬛', label: 'Mi QR' },
          { id: 'profile', icon: '👤', label: 'Perfil' },
        ].map(t => (
          <button key={t.id} style={{
            ...styles.tabItem,
            color: tab === t.id ? T.primary : T.muted
          }}
            onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{
              ...styles.tabLabel,
              color: tab === t.id ? T.primary : T.muted
            }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}