import { useEffect, useRef, useState } from 'react';
import './App.css';
import { db } from './Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import QrScanner from './QrScanner';
import { collection, getDocs } from 'firebase/firestore'; // ya deberías tenerlo en tus imports

function App() {
  const [cliente, setCliente] = useState(null);
  const [puntos, setPuntos] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [escaneando, setEscaneando] = useState(true);
const [premiosDisponibles, setPremiosDisponibles] = useState([]);

  const premiosCargadosRef = useRef(false); // 👈 Solo se ejecuta una vez

  useEffect(() => {
    const cargarPremios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'premios'));
        const premios = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("🎁 Premios desde Firebase:", premios);
        setPremiosDisponibles(premios);
      } catch (err) {
        console.error("❌ Error al cargar premios:", err);
      }
    };

    if (!premiosCargadosRef.current) {
      premiosCargadosRef.current = true;
      cargarPremios();
    }
  }, []);














  const onScan = async (codigoQR) => {
    setEscaneando(false);

    const partes = codigoQR.split('|');
    if (partes.length !== 2) {
      setMensaje("❌ QR inválido. Formato esperado: telefono|token");
      setEscaneando(true);
      return;
    }

    const [telefono, token] = partes.map(p => p.trim());

    try {
      const ref = doc(db, 'clientes', telefono);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setMensaje("❌ Cliente no encontrado");
        setEscaneando(true);
        return;
      }

      const data = snap.data();
      if (data.token !== token) {
        setMensaje("❌ Token inválido");
        setEscaneando(true);
        return;
      }

      // Asegurar que 'reclamados' esté presente como array
      setCliente({
        ...data,
        reclamados: Array.isArray(data.reclamados) ? data.reclamados : [],
      });
      setMensaje('');
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error consultando cliente");
      setEscaneando(true);
    }
  };

  const sumarPuntos = async () => {
    if (!cliente) return;
    const pts = parseInt(puntos, 10);
    if (isNaN(pts) || pts <= 0) {
      setMensaje("❌ Ingresa un número válido de puntos.");
      return;
    }

    const nuevosPuntos = (cliente.puntos || 0) + pts;

    try {
      await updateDoc(doc(db, 'clientes', cliente.telefono), {
        puntos: nuevosPuntos,
        token: cliente.token,
      });

      setCliente({ ...cliente, puntos: nuevosPuntos });
      setPuntos('');
      setMensaje(`✅ Se sumaron ${pts} puntos. Total: ${nuevosPuntos}`);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al actualizar puntos");
    }
  };



  const reclamarPremio = async (premio) => {
    if (!cliente) return;

    const puntosDisponibles = cliente.puntos || 0;
    const yaReclamados = Array.isArray(cliente.reclamados) ? cliente.reclamados : [];

    if (puntosDisponibles < premio.costo) {
      setMensaje("❌ No tienes suficientes puntos para este premio.");
      return;
    }

    if (yaReclamados.includes(premio.nombre)) {
      setMensaje("❌ Ya reclamaste este premio.");
      return;
    }

    try {
      const nuevosPuntos = puntosDisponibles - premio.costo;
      const nuevosReclamados = [...yaReclamados, premio.nombre];

      await updateDoc(doc(db, 'clientes', cliente.telefono), {
        puntos: nuevosPuntos,
        reclamados: nuevosReclamados,
        token: cliente.token,
      });

      setCliente({
        ...cliente,
        puntos: nuevosPuntos,
        reclamados: nuevosReclamados,
      });

      setMensaje(`✅ Reclamaste "${premio.nombre}". Te quedan ${nuevosPuntos} puntos.`);
    } catch (err) {
      console.error("❌ Error al reclamar premio:", err);
      setMensaje("❌ Error al reclamar premio.");
    }
  };

  return (
    <>
      <article className='contefull'>
        <section className='hderd'>
          <img
            className='logodellocal'
          src="https://res.cloudinary.com/db8e98ggo/image/upload/v1752425938/Dise%C3%B1o_sin_t%C3%ADtulo_1_kutm4q.png"
          />
        </section>

        {cliente ? (
          <div className='CONTESCANERdatosfull'>
           <p className='CLITTILU'   >Datos del cliente</p>
            <div className='datos'>
              <p><strong>Nombre</strong> {cliente.nombre}</p>
              <p><strong>Teléfono</strong> {cliente.telefono}</p>
              <p><strong>Puntos</strong> {cliente.puntos}</p>
            </div>

            <section className='agrgaragpuntos'>
              <input
                type="number"
                value={puntos}
                className='inputpuntos'
                onChange={(e) => setPuntos(e.target.value)}
                placeholder="Puntos a agregar"
              />
              <button className='btnagrgar' onClick={sumarPuntos}>Agregar</button>
            </section>

            <section className='premios'>
              <h3>Premios disponibles</h3>

              <ul className='premioslist'>
                {premiosDisponibles.map((premio) => {
                  const yaReclamado = (cliente.reclamados || []).includes(premio.nombre);
                  const puedeReclamar = (cliente.puntos || 0) >= premio.costo && !yaReclamado;

                  return (
                    <li key={premio.nombre} className='ptmio'>
                    <strong>{premio.nombre}</strong> {premio.costo} puntos
                      {yaReclamado ? (
                        <span style={{ color: 'gray', marginLeft: 10 }}>✅ Ya reclamado</span>
                      ) : (
                        <button
                          onClick={() => reclamarPremio(premio)}
                          disabled={!puedeReclamar}
                         className='btnagrgar'
                        >
                          Canjear
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            

       
          


   




     <div className='instruciones'  >

<h2>Instruciones</h2>
<p>1. Escanea el código QR del cliente.</p>
<p>2. Verifica los puntos y premios disponibles.</p>
<p>3. Agrega puntos si es necesario.</p>
<p>4. Reclama premios según los puntos del cliente.</p>
<p>5. Puedes escanear otro cliente en cualquier momento.</p>
          </div>




        <button
           className='btscaneartor'  
              onClick={() => {
                setCliente(null);
                setEscaneando(true);
                setPuntos('');
                setMensaje('');
              }}
              >
              Escanear otro
            </button>


              </section>
          
          </div>
        )
        
        
        :
         (
          <div className='CONTESCANER'>
            <h2 className='tulodescnar' >Escanea el QR del cliente</h2>
            <QrScanner activo={escaneando} onScan={onScan} />
          
          

     <div className='instrucionef'  >

<h2>Instruciones</h2>
<p>1. Escanea el código QR del cliente.</p>
<p>2. Verifica los puntos y premios disponibles.</p>
<p>3. Agrega puntos si es necesario.</p>
<p>4. Reclama premios según los puntos del cliente.</p>
<p>5. Puedes escanear otro cliente en cualquier momento.</p>
          </div>

          
          
          </div>
        )}

      
      

     
      
      </article>
    </>
  );
}

export default App;
