import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import GroupList from './GroupList';

const Materials = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [fileUrls, setFileUrls] = useState([]);
  const [userNames, setUserNames] = useState({}); // Store uploader names by UID

  // Fetch the groups the user has joined
  useEffect(() => {
    const fetchGroups = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("User is not logged in.");
        return;
      }

      const groupRef = collection(firestore, 'groups');
      const groupQuery = query(groupRef, where('groupMembers', 'array-contains', currentUser.uid));
      const groupSnapshot = await getDocs(groupQuery);
      const userGroups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(userGroups);
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
  const handleUpload = () => {
    if (!selectedGroup || !file) {
      console.error("No group selected or no file chosen.");
      return;
    }

    const storage = getStorage();
    const auth = getAuth();
    const storageRef = ref(storage, `groups/${selectedGroup.id}/files/${auth.currentUser.uid}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("File upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrl(downloadURL);
          fetchFiles(selectedGroup); // Refresh file list after upload
        });
      }
    );
  };

  // Fetch uploader names from Firestore
  const fetchUserName = async (uid) => {
    if (userNames[uid]) return userNames[uid]; // Return cached name if available
    const userDoc = doc(firestore, 'users', uid); // Adjust collection name if needed
    const userSnap = await getDoc(userDoc);
    const userName = userSnap.exists() ? userSnap.data().name : 'Unknown User';
    setUserNames((prev) => ({ ...prev, [uid]: userName })); // Cache the name
    return userName;
  };

  // Fetch files for the selected group
  const fetchFiles = async (group) => {
    if (!group) return;

    const storage = getStorage();
    const groupFilesRef = ref(storage, `groups/${group.id}/files`);
    
    listAll(groupFilesRef)
      .then(async (res) => {
        const filePromises = res.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          const uploaderUid = itemRef.name.split('_')[0]; // Extract UID
          const uploaderName = await fetchUserName(uploaderUid); // Fetch uploader name
          return { name: itemRef.name.split('_').slice(1).join('_'), url: downloadURL, uploader: uploaderName };
        });
        return Promise.all(filePromises);
      })
      .then((files) => setFileUrls(files))
      .catch((error) => console.error('Error fetching files:', error));
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
