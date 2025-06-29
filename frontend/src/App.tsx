import './App.css'
import UploadPDF from './components/custom/test'

import { Button } from './components/ui/button'

function App() {
  
  return (
      <div>
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
        <Button>Click me</Button>
        <UploadPDF />
      </div>
  )
}

export default App
