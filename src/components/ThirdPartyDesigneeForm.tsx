import React from 'react';
import { Formik, Form, Field,FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Switch from 'react-switch';
import './ThirdPartyDesigneeForm.css';
import formDetails from './details.json';
interface FormValues {
  allowDesignee: boolean;
  designeeName: string;
  phoneNumber: string;
  pinNumber: string;
  vehicles: Array<{ vinNumber: string; modelNumber: string }>;
}

const ThirdPartyDesigneeForm: React.FC = () => {
  const initialValues: FormValues = {
    allowDesignee: false,
    designeeName: '',
    phoneNumber: '',
    pinNumber: '',
    vehicles: [{ vinNumber: '', modelNumber: '' }],
  };

  const validationSchema = Yup.object().shape({
    allowDesignee: Yup.boolean(),
    designeeName: Yup.string().when('allowDesignee', {
      is: true,
      then: (schema) => schema.required('Designee Name is required'),
      otherwise: (schema) => schema,
    }),
    phoneNumber: Yup.string().when('allowDesignee', {
      is: true,
      then: (schema) => schema.matches(/^\d+$/, 'Phone number must contain only digits')
      .min(10, 'Phone number must be exactly 10 digits')
      .max(10, 'Phone number must be exactly 10 digits')
      .required('Phone Number is required'),
    
      otherwise: (schema) => schema,
    }),
    pinNumber: Yup.string().when('allowDesignee', {
      is: true,
      then: (schema) => schema.required('PIN Number is required'),
      otherwise: (schema) => schema,
    }),
    vehicles: Yup.array()
    .of(
      Yup.object().shape({
         vinNumber: Yup.string().required('VIN Number is required'),
      modelNumber: Yup.string().required('Model Number is required'),
          })
      ),
  });

  const handleSubmit = (values: FormValues) => {
    console.log("Form Values:", values);
    // console.log("Vehicle Details:", values.vehicles);
   
  };

  return (
<div className="form-container">
      <h1>Third Party Designee</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true} 
        validateOnBlur={true}  
      >
        {({ values, setFieldValue, isValid,errors }) => (
          <Form>
            <div className="form-group">
              <label>
                Do you want to allow another person to discuss this return with IRS?
              </label>
              <Switch
                onChange={(checked) => setFieldValue('allowDesignee', checked)}
                checked={values.allowDesignee}
                className="toggle-switch"
                offColor="#888"
                onColor="#6A1B9A"
                checkedIcon={<div className="switch-checked">Yes</div>}
                uncheckedIcon={<div className="switch-unchecked">No</div>}
              />
            </div>
            <div className="form-group-row">
              {formDetails.slice(0, 3).map((field, index) => (
                <label key={index} htmlFor={field.htmlFor}>{field.label}</label>
              ))}
            </div>
            <div className="form-group-row">
              {formDetails.slice(0, 3).map((field, index) => (
                <div key={index}>
                  <Field type={field.type} id={field.id} name={field.name} placeholder={field.placeholder} className="form-input" />
                  <ErrorMessage name={field.name} component="div" className="error" />
                </div>
              ))}
            </div>
            <FieldArray name="vehicles">
              {({ push, remove }) => (
                <div>
                  {values.vehicles.map((vehicle, index) => (
                    <div key={index} className="vehicle-entry">
                      <div className="form-group-row">
                        {formDetails.slice(3, 5).map((field, fieldIndex) => (
                          <label key={fieldIndex} htmlFor={`vehicles.${index}.${field.htmlFor}`}>
                            {field.label}
                          </label>
                        ))}
                      </div>
                      <div className="form-group-row">
                        {formDetails.slice(3, 5).map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            <Field type={field.type} id={`vehicles.${index}.${field.id}`} name={`vehicles.${index}.${field.name}`}placeholder={field.placeholder} className="form-input" />
                            <ErrorMessage name={`vehicles.${index}.${field.name}`} component="div" className="error" />
                          </div>
                        ))}
                      </div>
                      {index > 0 && (
                        <button type="button" onClick={() => remove(index)} className="delete-button">
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push({ vinNumber: '', modelNumber: '' })}
                    className="add-more-button"
                  >
                    Add More
                  </button>
                </div>
              )}
            </FieldArray>
            <button type="submit" className="submit-button" disabled={!isValid}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ThirdPartyDesigneeForm;
