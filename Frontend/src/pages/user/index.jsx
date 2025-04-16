import { HeaderLogado } from "../cabecalho.jsx"
import { useState } from 'react'
const perfilUser = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null)


const handleChangeImage = (e) => {
  const file = e.target.files[0]
  setImage(file)
  
  if (file) {
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
  }
}

    return (
      <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
        <HeaderLogado/>

        <div className="container my-5 flex-column align-items-center rounded">
            //
        </div>
      </div>
    )
}

export default perfilUser