import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import GroupList from './GroupList';

const Materials = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [fileUrls, setFileUrls] = useState([]);

  // Fetch the groups the user has joined
  useEffect(() => {
    const fetchGroups = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("User is not logged in.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/groups/user/${currentUser.uid}`);
      if (res.ok) {
        setGroups(await res.json());
      }
    };
    fetchGroups();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedGroup || !file) {
      console.error("No group selected or no file chosen.");
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to upload files.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaderUid', currentUser.uid);

    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:5000/api/materials/upload/${selectedGroup.id}`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201) {
        setFile(null);
        setProgress(0);
        fetchFiles(selectedGroup);
      } else {
        alert('File upload failed.');
        setProgress(0);
      }
    };

    xhr.onerror = () => {
      alert('File upload failed.');
      setProgress(0);
    };

    xhr.send(formData);
  };

  // Fetch files for the selected group
  const fetchFiles = async (group) => {
    if (!group) return;
    const res = await fetch(`http://localhost:5000/api/materials/list/${group.id}`);
    if (res.ok) {
      setFileUrls(await res.json());
    }
  };

  // Fetch files whenever a new group is selected
  useEffect(() => {
    if (selectedGroup) {
      fetchFiles(selectedGroup);
    }
  }, [selectedGroup]);

  return (
    <div>
      {/* Group selection */}
      <GroupList groups={groups} setSelectedGroup={setSelectedGroup} />

      {/* File upload and list for selected group */}
      {selectedGroup && (
        <div>
          <h4>Files for Group: {selectedGroup.groupName}</h4>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
          <div style={{ width: `${progress}%`, background: 'blue', height: '5px' }}></div>

          <h5>Previous Files:</h5>
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Uploader</th>
                <th>Download Link</th>
              </tr>
            </thead>
            <tbody>
              {fileUrls.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.uploader}</td>
                  <td>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">Download</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Materials;