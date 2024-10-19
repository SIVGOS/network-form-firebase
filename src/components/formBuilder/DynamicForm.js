
import React, { useState, useEffect } from 'react';
import { getDocs } from 'firebase/firestore';
import {formCollection} from "../../firebase";
import inputTypes from './inputTypes.json'; // Import the JSON file
import './Styles.css';

const DynamicForm = ({ formName }) => {

  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    // Fetch the form schema from 'formSchema' collection in Firebase
    getDocs(formCollection)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const formData = doc.data();
          setFormFields(JSON.parse(formData.schema));
        });
      })
      .catch((error) => {
        console.log('Error getting documents: ', error);
      });
  }, [formName]);
  return (
    <form>
      {formFields.map((field, index) => (
        <div key={index}>
          <label>{field.label}</label><br/>
          {field.type === 'select' ? (
            <select>
              <option value="">Select an option</option>
              {inputTypes.types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          ) : (
            <input type={field.type} />
          )}
        </div>
      ))}
    </form>
  );

/*   return (
    <form>
      {formFields.map((field, index) => (
        <div key={index}>
          <label>{field.label}</label>
          <input type={field.type} />
        </div>
      ))}
    </form>
  ); */
};

export default DynamicForm;
