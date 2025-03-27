import React from 'react';
import PropTypes from "prop-types";
import '../Styles/Registros.css'; // Archivo CSS para estilos personalizados

const Registros = ({
    registros
}) => {
    return (
        <div className="registros-container">
            <h2 className="registros-titulo">Lista de Registros</h2>
            <div className="tabla-contenedor">
                <table className="tabla-registros">
                    <thead>
                        <tr>
                            {registros.length > 0 &&
                                Object.keys(registros[0]).map((key) => (
                                    <th key={key} className="tabla-encabezado">{key}</th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {registros.map((registro, index) => (
                            <tr key={index} className={index % 2 === 0 ? "fila-par" : "fila-impar"}>
                                {Object.values(registro).map((value, idx) => (
                                    <td key={idx} className="tabla-celda">{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

PropTypes.Registros = {
    registros: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Registros;