import React from "react";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importa los estilos por defecto

function Toast() {

  /*
    // Ejemplo de uso de los toasts
      "success":
        toast.success(msg);
        break;
       "error":
        toast.error(msg);
        break;
       "warn":
        toast.warn(msg);
        break;
      default:
        toast.info(msg);
        
  */

  return (
    <div>

      <ToastContainer 
          position="bottom-right"  // Posición: "top-left", "bottom-right", etc.
          autoClose={3000}  // Cierra en 3 segundos (por defecto)
          hideProgressBar={false} // Muestra la barra de progreso
          newestOnTop={true} // Muestra los toasts más recientes arriba
          closeOnClick
          pauseOnHover
          draggable
      />

    </div>
  );
}

export default Toast;