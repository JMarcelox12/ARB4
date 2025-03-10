import api from "@/services/api";
import styles from "./antCard.css";
import express from "express";

const router = express.Router()

export default function AntCard({ ant }){
    const deleteAnt = (id) => {
        api
        .delete("/ant/:id")
        .then((res) => {
            alert("Formiga excluída com sucesso!");
            router.reload();
        })
        .catch((err) => alert("Erro ao excluir formiga"));
    };

    const uploadAnt = () => {
        router.push("/ant/:id")
    }

    return (
        <div className={styles.container}>
            <p>{ant.nome}</p>
            <p>{ant.odd}</p>
            <button type="button" className={styles.btnUpdate} onClick={() => uploadAnt(ant.id)}/>
            <button type="button" className={styles.btnDelete} onClick={() => deleteAnt(ant.id)}/>
        </div>
    )
}