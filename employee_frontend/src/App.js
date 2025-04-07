import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './App.css';



const MySwal = withReactContent(Swal);

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async () => {
    const res = await axios.get('http://localhost:5000/employees');
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showEmployeeForm = async (employee = null) => {
    const isEdit = !!employee;

    const { value: formValues } = await MySwal.fire({
      title: isEdit ? 'Edit Employee' : 'Add Employee',
      html: (
        <div>
          <input id="name" className="swal2-input" placeholder="Name" defaultValue={employee?.name || ''} />
          <input id="dob" className="swal2-input" type="date" defaultValue={employee?.dob || ''} />
          <select id="gender" className="swal2-input" defaultValue={employee?.gender || 'Male'}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input id="email" className="swal2-input" placeholder="Email" defaultValue={employee?.email || ''} />
          <input id="phone" className="swal2-input" placeholder="Phone" defaultValue={employee?.phone || ''} />
          <input id="position" className="swal2-input" placeholder="Position" defaultValue={employee?.position || ''} />
          <input id="salary" className="swal2-input" type="number" placeholder="Salary" defaultValue={employee?.salary || ''} />
        </div>
      ),
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const dob = document.getElementById('dob').value;
        const gender = document.getElementById('gender').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const position = document.getElementById('position').value;
        const salary = document.getElementById('salary').value;

        if (!name || !dob || !gender || !email || !phone || !position || !salary) {
          Swal.showValidationMessage('Please fill in all required fields');
          return;
        }

        return { name, dob, gender, email, phone, position, salary };
      }
    });

    if (formValues) {
      try {
        if (isEdit) {
          await axios.put(`http://localhost:5000/employees/${employee.employee_id}`, {
            ...employee,
            ...formValues,
          });
          Swal.fire('Updated!', 'Employee updated successfully.', 'success');
        } else {
          await axios.post('http://localhost:5000/employees', formValues);
          Swal.fire('Added!', 'Employee added successfully.', 'success');
        }
        fetchEmployees();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.error || 'Something went wrong!', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this employee?',
      text: `Do you want to delet Employee`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    });

    if (result.isConfirmed) {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      fetchEmployees();
      Swal.fire('Deleted!', 'Employee has been removed.', 'success');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Employee Management</h2>
      <button className="btn btn-primary mb-3" onClick={() => showEmployeeForm()}>Add Employee</button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Position</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.employee_id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.position}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => showEmployeeForm(emp)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.employee_id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
