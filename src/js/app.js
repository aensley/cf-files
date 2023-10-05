/* global XMLHttpRequest */

;(function () {
  let uploadButton,
    cancelButton,
    fileUpload,
    fileProgress,
    fileName,
    // fileTable,
    dropZone,
    lastDropTarget,
    uploadRequest

  let dragEntered = false

  // const downloadIcon =
  //  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>'
  // const deleteIcon =
  //  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16"><path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/></svg>'

  document.addEventListener('DOMContentLoaded', (event) => {
    uploadButton = document.getElementById('uploadButton')
    cancelButton = document.getElementById('cancelButton')
    fileUpload = document.getElementById('fileUpload')
    fileProgress = document.getElementById('fileProgress')
    fileName = document.getElementById('fileName')
    // fileTable = document.getElementById('fileTable')
    dropZone = document.getElementById('dropZone')
    dropZone.addEventListener('drop', dropHandler)
    window.addEventListener('dragover', noDefaultHandler)
    fileUpload.addEventListener('change', fileInputChangeHandler)
    window.addEventListener('dragenter', dragEnterHandler)
    window.addEventListener('dragleave', dragLeaveHandler)
    uploadButton.addEventListener('click', uploadButtonClickHandler)
    cancelButton.addEventListener('click', cancelButtonClickHandler)
    listFiles()
  })

  const listFiles = async () => {
    // const newTbody = document.createElement('tbody')
    fetch('/files/')
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
      })
    /* fetch('/files/').then((response) => {
      const files = await response.json()
      console.log(files)
      foreach (file in files) {
        const tr = document.createElement('tr')
        const td = document.createElement('td')
        td.textContent = JSON.toString(file)
        tr.appendChild(td)
        newTbody.appendChild(tr)
      }

      fileTable.replaceChild(newTbody, fileTable.querySelector('tbody'))
    }) */
  }

  const cancelButtonClickHandler = async (e) => {
    e.preventDefault()
    if (uploadRequest) {
      uploadRequest.abort()
    }
  }

  const uploadFile = (file) => {
    fileProgress.value = null
    fileProgress.textContent = ''
    fileProgress.style.visibility = 'visible'
    cancelButton.style.visibility = 'visible'
    fileName.textContent = file.name
    uploadRequest = new XMLHttpRequest()
    uploadRequest.upload.addEventListener('progress', (e) => {
      const percent = ((e.loaded / e.total) * 100).toFixed(1)
      fileProgress.value = percent
      fileProgress.textContent = percent + '%'
    })
    uploadRequest.addEventListener('load', () => console.log(uploadRequest.status, uploadRequest.responseText))
    uploadRequest.addEventListener('error', () => console.log(new Error('File upload failed')))
    uploadRequest.addEventListener('abort', () => console.log(new Error('File upload aborted')))
    uploadRequest.open('POST', 'files/' + encodeURIComponent(file.name), true)
    uploadRequest.send(file)
  }

  const fileInputChangeHandler = async (e) => {
    const response = await uploadFile(e.currentTarget.files[0])
    if (response.status >= 400) {
      throw new Error(`File upload failed - Status code: ${response.status}`)
    }

    console.log('Response:', response.body)
  }

  const uploadButtonClickHandler = async (e) => {
    e.preventDefault()
    fileUpload.click()
  }

  const dragEnterHandler = async (e) => {
    lastDropTarget = e.target
    if (!dragEntered) {
      dragEntered = true
      dropZone.style.visibility = ''
      dropZone.style.display = 'table'
      dropZone.style.opacity = 1
    }
  }

  const dragLeaveHandler = async (e) => {
    if (e.target === lastDropTarget || e.target === document) {
      dropZone.style.visibility = 'hidden'
      dropZone.style.display = 'none'
      dropZone.style.opacity = 0
      dragEntered = false
    }
  }

  const noDefaultHandler = async (e) => {
    e.preventDefault()
  }

  const dropHandler = async (e) => {
    e.preventDefault()

    dropZone.style.visibility = 'hidden'
    dropZone.style.display = 'none'
    dropZone.style.opacity = 0
    dragEntered = false

    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (const item of e.dataTransfer.items) {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const response1 = await uploadFile(item.getAsFile())
          if (response1.status >= 400) {
            throw new Error(`File upload failed - Status code: ${response1.status}`)
          }

          console.log('Response:', response1.body)
          break
        }
      }
    } else {
      const response = await uploadFile(e.dataTransfer.files[0])
      if (response.status >= 400) {
        throw new Error(`File upload failed - Status code: ${response.status}`)
      }

      console.log('Response:', response.body)
    }
  }
})()
