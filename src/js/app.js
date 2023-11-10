/* global XMLHttpRequest, confirm, Image */
import { isImage, isVideo } from '../ts/file.ts'

// Wrap everything in a SEAF for optimized minification
;(function () {
  let uploadButton, cancelButton, fileUpload, fileProgress, fileName, fileTable, dropZone, lastDropTarget, uploadRequest
  let dragEntered = false

  /**
   * Creates an HTML element. Shortcut function for optimized minification.
   *
   * @param {string}  el       The name of the element to create.
   * @param {string} [content] Optional contents to fill element with.
   *
   * @returns {HTMLElement} The newly created HTML element.
   */
  const createElement = (el, content) => {
    const element = document.createElement(el)
    if (typeof content !== 'undefined') {
      element.innerHTML = content
    }

    return element
  }

  const escapeElement = createElement('textarea')
  const deleteIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill me-1" viewBox="0 0 16 16"><path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/></svg>'

  document.addEventListener('DOMContentLoaded', (event) => {
    uploadButton = getElementById('uploadButton')
    cancelButton = getElementById('cancelButton')
    fileUpload = getElementById('fileUpload')
    fileProgress = getElementById('fileProgress')
    fileName = getElementById('fileName')
    fileTable = getElementById('fileTable')
    dropZone = getElementById('dropZone')
    dropZone.addEventListener('drop', dropHandler)
    window.addEventListener('dragover', noDefaultHandler)
    fileUpload.addEventListener('change', fileInputChangeHandler)
    window.addEventListener('dragenter', dragEnterHandler)
    window.addEventListener('dragleave', dragLeaveHandler)
    uploadButton.addEventListener('click', uploadButtonClickHandler)
    cancelButton.addEventListener('click', cancelButtonClickHandler)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.delete')) {
        e.preventDefault()
        deleteButtonClickHandler(e)
      }
    })
    resetUploadUi()
    listFiles()
  })

  /**
   * Lists available files returned from the server. Put them in the file list table on the page.
   */
  const listFiles = async () => {
    fetch('/files/')
      .then((response) => response.json())
      .then((data) => {
        const newTbody = createElement('tbody')
        data.forEach((file) => {
          const tr = createElement('tr')
          tr.appendChild(
            createElement(
              'td',
              // File name and download link.
              '<a href="/files/' + encodeURIComponent(file.key) + '">' + getPreview(file.key) + '</a>'
            )
          )
          tr.appendChild(
            createElement(
              'td',
              // File name and download link.
              '<a href="/files/' + encodeURIComponent(file.key) + '">' + escapeHtml(file.key) + '</a>'
            )
          )
          // File size.
          tr.appendChild(createElement('td', humanFileSize(file.size)))
          tr.appendChild(
            createElement(
              'td',
              // Uploaded date.
              new Date(file.uploaded).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short'
              })
            )
          )
          tr.appendChild(
            createElement(
              'td',
              // Delete button.
              '<button class="btn btn-danger delete" data-file="' +
                escapeHtml(file.key) +
                '">' +
                deleteIcon +
                ' Delete</button>'
            )
          )
          newTbody.appendChild(tr)
        })

        fileTable.replaceChild(newTbody, fileTable.querySelector('tbody'))
      })
  }

  const getPreview = (fileName) => {
    if (isImage(fileName) || isVideo(fileName)) {
      return '<img class="thumb" src="/files/thumbs/' + encodeURIComponent(fileName) + '.jpg" />'
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-fill" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/></svg>'
  }

  /**
   * Upload a file.
   *
   * @param {File} file The file to upload.
   */
  const uploadFile = async (file) => {
    fileProgress.style.visibility = 'visible'
    cancelButton.style.visibility = 'visible'
    fileName.textContent = file.name
    uploadThumb(file)
    uploadRequest = new XMLHttpRequest()
    uploadRequest.upload.addEventListener('progress', (e) => {
      const percent = ((e.loaded / e.total) * 100).toFixed(1)
      fileProgress.value = percent
      fileProgress.textContent = percent + '%'
    })
    uploadRequest.addEventListener('load', () => {
      console.log(uploadRequest.status, uploadRequest.responseText)
      resetUploadUi()
      listFiles()
    })
    uploadRequest.addEventListener('error', () => {
      console.log(new Error('File upload failed'))
      resetUploadUi()
    })
    uploadRequest.addEventListener('abort', () => {
      console.log(new Error('File upload aborted'))
      resetUploadUi()
    })
    uploadRequest.open('PUT', 'files/' + encodeURIComponent(file.name), true)
    uploadRequest.send(file)
  }

  /**
   * Generates and uploads a thumbnail for the file if applicable.
   *
   * @param {File} file The file to upload a thumbnail for.
   */
  const uploadThumb = async (file) => {
    let thumbnailData
    if (isImage(file.name)) {
      thumbnailData = await generateImageThumbnail(file, 100, 75)
    } else if (isVideo(file.name)) {
      thumbnailData = await generateVideoThumbnail(file, 100, 75)
    }

    if (typeof thumbnailData !== 'undefined') {
      const thumbUploadRequest = new XMLHttpRequest()
      thumbUploadRequest.addEventListener('load', () => {
        console.log(thumbUploadRequest.status, thumbUploadRequest.responseText)
      })
      thumbUploadRequest.addEventListener('error', () => {
        console.log(new Error('Thumbnail upload failed'))
      })
      thumbUploadRequest.open('PUT', 'files/thumbs/' + encodeURIComponent(file.name) + '.jpg', true)
      thumbUploadRequest.send(thumbnailData.data)
    }
  }

  /**
   * Creates a thumbnail from a File object containing an image.
   * The thumbnail is contained within maximum dimensions while preserving aspect ratio.
   *
   * @param {File}   file      The image file to create a thumbnail from.
   * @param {Number} maxWidth  The maximum width for the generated thumbnail.
   * @param {Number} maxHeight The maximum height for the generated thumbnail.
   *
   * @returns {Promise<ImageData>} The generated thumbnail as an ImageData object.
   */
  const generateImageThumbnail = (file, maxWidth, maxHeight) => {
    const canvas = createElement('canvas')
    const ctx = canvas.getContext('2d')
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = function () {
        const scaleRatio = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
        const w = Math.floor(img.width * scaleRatio)
        const h = Math.floor(img.height * scaleRatio)
        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)
        return resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
      }

      img.src = window.URL.createObjectURL(file)
    })
  }

  /**
   * Creates a thumbnail from a File object containing an image.
   * The thumbnail is contained within maximum dimensions while preserving aspect ratio.
   *
   * @param {File}   file      The image file to create a thumbnail from.
   * @param {Number} maxWidth  The maximum width for the generated thumbnail.
   * @param {Number} maxHeight The maximum height for the generated thumbnail.
   *
   * @returns {Promise<ImageData>} The generated thumbnail as an ImageData object.
   */
  const generateVideoThumbnail = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = createElement('canvas')
      const video = createElement('video')

      video.autoplay = true
      video.muted = true
      video.onloadeddata = () => {
        const ctx = canvas.getContext('2d')
        const scaleRatio = Math.min(maxWidth / video.videoWidth, maxHeight / video.videoHeight, 1)
        const w = Math.floor(video.videoWidth * scaleRatio)
        const h = Math.floor(video.videoHeight * scaleRatio)

        canvas.width = w
        canvas.height = h

        ctx.drawImage(video, 0, 0, w, h)
        // Seek to 5 seconds in, or half the length of the video, whichever is less.
        video.currentTime = Math.floor(Math.min(5, video.duration / 2))
        video.pause()
        return resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
      }

      video.src = window.URL.createObjectURL(file)
    })
  }

  /**
   * Escapes characters so that they display properly in HTML as the given string.
   *
   * @param {string} html The HTML to escape.
   *
   * @returns {string} The escaped content.
   */
  const escapeHtml = (html) => {
    escapeElement.textContent = html
    return escapeElement.innerHTML
  }

  /**
   * Handle the delete button click event.
   *
   * @param {Event} e The event.
   */
  const deleteButtonClickHandler = async (e) => {
    const fileKey = encodeURIComponent(e.target.closest('.delete').getAttribute('data-file'))
    if (confirm('Delete ' + fileKey + '?')) {
      fetch('/files/' + fileKey, { method: 'DELETE' }).then(listFiles)
    }
  }

  /**
   * Converts a file size in bytes to a human-readable format.
   *
   * @param {Number} size The size to convert.
   *
   * @returns {string} The human-readable file size.
   */
  const humanFileSize = (size) => {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
  }

  /**
   * Handle the cancel button click event.
   *
   * @param {Event} e The event.
   */
  const cancelButtonClickHandler = async (e) => {
    e.preventDefault()
    if (uploadRequest) {
      uploadRequest.abort()
    }
  }

  /**
   * Reset the file upload UI elements.
   */
  const resetUploadUi = () => {
    fileProgress.value = null
    fileProgress.textContent = ''
    fileProgress.style.visibility = 'hidden'
    cancelButton.style.visibility = 'hidden'
    fileName.textContent = ''
    fileUpload.value = null
  }

  /**
   * Handle the file input change event.
   *
   * @param {Event} e The event.
   */
  const fileInputChangeHandler = async (e) => {
    uploadFile(e.currentTarget.files[0])
  }

  /**
   * Handle the upload button click event.
   *
   * @param {Event} e The event.
   */
  const uploadButtonClickHandler = async (e) => {
    e.preventDefault()
    fileUpload.click()
  }

  /**
   * Handle the Drag Enter event.
   *
   * @param {Event} e The event.
   */
  const dragEnterHandler = async (e) => {
    lastDropTarget = e.target
    if (!dragEntered) {
      dragEntered = true
      dropZone.style.visibility = ''
      dropZone.style.display = 'table'
      dropZone.style.opacity = 1
    }
  }

  /**
   * Handle the drag leave event.
   *
   * @param {Event} e The event.
   */
  const dragLeaveHandler = async (e) => {
    if (e.target === lastDropTarget || e.target === document) {
      dropZone.style.visibility = 'hidden'
      dropZone.style.display = 'none'
      dropZone.style.opacity = 0
      dragEntered = false
    }
  }

  /**
   * Prevent the default handler for the given event.
   *
   * @param {Event} e The event.
   */
  const noDefaultHandler = async (e) => {
    e.preventDefault()
  }

  /**
   * Handle the drop event.
   *
   * @param {Event} e The event.
   */
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
          uploadFile(item.getAsFile())
          break
        }
      }
    } else {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  /**
   * Get a document element by ID. Shortcut function for optimized minification.
   *
   * @param {string} id The ID of the element to get.
   *
   * @returns {HTMLElement} The element with the given ID.
   */
  const getElementById = (id) => {
    return document.getElementById(id)
  }
})()
