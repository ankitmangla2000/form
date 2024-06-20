import React, {useState} from 'react';
import { Formik, Form, Field,FieldArray, ErrorMessage ,useFormikContext} from 'formik';
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
  const [addMoreError, setAddMoreError] = useState<string | null>(null);
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

  // const handleSubmit = (values: FormValues) => {
  //   console.log("Form Values:", values);
  //   // console.log("Vehicle Details:", values.vehicles);
   
  // };
  const handleSubmit = (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
   
    validationSchema.validate(values, { abortEarly: false }).then(() => {
  
      console.log("Form Values:", values);
    
    }).catch(errors => {
     
      console.error("Validation errors:", errors);
     
    }).finally(() => {
      setSubmitting(false); 
    });
  };

  return (
<div className="form-container">
      <h1>Third Party Designee</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isValid, isSubmitting, errors }) => (
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
            {values.allowDesignee && (
              <div className="designee-details">
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
              </div>
            )}
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
                   {addMoreError && <div className="error">{addMoreError}</div>}
                  <button
                    type="button"
                    onClick={() => {
                      setAddMoreError(null); 
                      // Validate all current vehicle entries
                      const allEntriesValid = values.vehicles.every(vehicle => {
                        try {
                          Yup.object().shape({
                            vinNumber: Yup.string().required('VIN Number is required'),
                            modelNumber: Yup.string().required('Model Number is required'),
                          }).validateSync(vehicle, { abortEarly: false });
                          return true;
                        } catch (error) {
                          return false;
                        }
                      });

                      if (allEntriesValid) {
                        // All current entries are valid, add new entry
                        push({ vinNumber: '', modelNumber: '' });
                      } else {
                        // Handle invalid state (e.g., show message)
                        console.log('Please fill out all fields above.');
                        setAddMoreError('Please fill out all fields above.');
                      }
                    }}
                    className="add-more-button"
                  >
                    Add More
                  </button>
                </div>
              )}
            </FieldArray>
            <button type="submit" className="submit-button"  >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ThirdPartyDesigneeForm;
