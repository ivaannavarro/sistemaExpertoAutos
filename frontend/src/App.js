import {useState} from "react";
import Diagnostico from "./Componentes/Diagnostico";
import "./Styles/styles.css";
import Navbar from "./Componentes/Navbar";

function App() {
  const [paginaPrincipal, setPaginaPrincipal] = useState(true);
  const [tabla, setTabla] = useState(false);

  return (
    <>
    <div className="App">
      <Navbar />

      <button 
            className="boton azul" 
            onClick={() => setPaginaPrincipal(!paginaPrincipal)}
      >
            Abrir pagina de diagnostico
      </button>
        
      {paginaPrincipal &&
        <>
          <Diagnostico 
              tabla={tabla}   
              setTabla={setTabla}    
              setPaginaPrincipal={setPaginaPrincipal} 
              paginaPrincipal={paginaPrincipal}  
          />
        </>
      }
    </div>
    </>
  );
}

export default App;
