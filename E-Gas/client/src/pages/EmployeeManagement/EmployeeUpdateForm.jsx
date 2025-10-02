import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import SideBar from '../../components/SideBar';

export default function EmployeeUpdateForm() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [employeeData, setEmployeeData] = useState({
        name: "",
        contactNo: "",
        DOB: "",
        address: "",
        email: "",
        NIC: "",
        empRole: "",
        maritalStatus: "",
        gender: "",
    });

    useEffect(() => {
        axios.get(`http://localhost:3000/api/employee/get/${id}`)
        .then(result => {
            const employee = result.data.employee;
            employee.DOB = employee.DOB.split('T')[0];
            setEmployeeData(employee);y
        })
        .catch(err => console.log(err));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleMaritalStatusChange = (e) => {
        const { id, checked } = e.target;
        const newMaritalStatus = checked ? id : '';
        setEmployeeData(prevState => ({
            ...prevState,
            maritalStatus: newMaritalStatus
        }));
    };

    const handleGenderChange = (e) => {
        const { id, checked } = e.target;
        const newGender = checked ? id : '';
        setEmployeeData(prevState => ({
            ...prevState,
            gender: newGender
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:3000/api/employee/update/${id}`, employeeData)
        .then(() => {
            toast.success('Updated employee successfully!');
            setTimeout(() => {
                navigate('/employee-management');
            });
        })
        .catch(error => {
            toast.error('Update employee failed!');
            console.error('Error updating employee:', error);
        });
    };

    return (
        <div className="flex">
            <SideBar />
            <div className="flex-1">
                <div className="bg-paleblue justify-between flex px-10 py-8">
                    <h1 className="text-4xl font-bold text-blue">
                        Employee Update Form
                    </h1>
                    <div className="flex gap-2">
                        
                        <div className="flex w-full flex-col gap-0.5">
                            <div className="flex items-center justify-between font-bold">
                                <h1>Dinuja A.A.K IT23674394</h1>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div className="px-10 text-2xl font-semibold pt-5">
                    <span className="">Update Employee</span>
                </div>
                <div className="p-10 bg-paleblue m-10 rounded-3xl max-w-4xl border-2 border-light-blue">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col sm:flex-row gap-10"
                    >
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="font-semibold text-black">Employee Name</label>
                            <input
                                type="text"
                                placeholder="Enter Name"
                                id="name"
                                name="name"
                                value={employeeData.name}
                                onChange={handleChange}
                                className="border-2 border-gray outline-none rounded-md p-2 mb-4"
                                required
                            />

                            <label className="font-semibold text-black">Contatc No</label>
                            <input
                                type="text"
                                placeholder="Enter mobile number"
                                id="contactNo"
                                name="contactNo"
                                value={employeeData.contactNo}
                                onChange={handleChange}
                                className="border-2 border-gray outline-none rounded-md p-2 mb-4"
                                required
                            />

                            <label className="font-semibold text-black">Date of Bitrh</label>
                            <input
                                type="date"
                                id="DOB"
                                name="DOB"
                                value={employeeData.DOB}
                                onChange={handleChange}
                                className="border-2 border-gray outline-none rounded-md p-2 mb-4"
                                required
                            />

                            <label className="font-semibold text-black">Description</label>
                            <textarea
                                type="textarea"
                                placeholder="Enter description"
                                id="address"
                                name="address"
                                value={employeeData.address}
                                onChange={handleChange}
                                className="border-2 border-gray outline-none rounded-md p-2 mb-4 max-h-40 min-h-40"
                                required
                            />

                            <input
                                type="submit"
                                value="Submit"
                                className="bg-light-blue hover:bg-blue font-semibold text-white p-3 rounded-lg w-full cursor-pointer"
                            />
                        </div>

                                            <div className="flex flex-col gap-1 flex-1">
                        <label className="font-semibold text-black">Email</label>
                        <input
                            type="text"
                            placeholder="Enter email"
                            id="email"
                            name="email"
                            value={employeeData.email}
                            onChange={handleChange}
                            className="border-2 border-gray outline-none rounded-md p-2 mb-4"
                            required
                        />

                        <label className="font-semibold text-black">NIC</label>
                        <input
                            type="text"
                            placeholder="Enter NIC"
                            id="NIC"
                            name="NIC"
                            value={employeeData.NIC}
                            onChange={handleChange}
                            className="border-2 border-gray outline-none rounded-md p-2 mb-4"
                            required
                        />

                        <label className="font-semibold text-black">Job Role</label>
                        <select
                            id="empRole"
                            name="empRole"
                            value={employeeData.empRole}
                            onChange={handleChange}
                            className="border-2 border-gray outline-none rounded-md p-2 mb-4"
                            required
                        >
                            <option value="Delivery Manager">Delivery Manager</option>
                            <option value="Employee Manager">Employee Manager</option>
                            <option value="Inventory Manager">Inventory Manager</option>
                            <option value="User Manager">User Manager</option>
                        </select>

                        <label className="font-semibold text-black">Marital Status</label>
                        <div className="flex gap-6 flex-wrap">
                            <div className="flex gap-2">
                                <input
                                    onChange={handleMaritalStatusChange}
                                    checked={employeeData.maritalStatus === "Maried"}
                                    type="checkbox"
                                    name="maritalStatus"
                                    id="Maried"
                                    className="w-5"
                                />
                                <span>Married</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    onChange={handleMaritalStatusChange}
                                    checked={employeeData.maritalStatus === "Unmaried"}
                                    type="checkbox"
                                    name="maritalStatus"
                                    id="Unmaried"
                                    className="w-5"
                                />
                                <span>Not Married</span>
                            </div>
                        </div>

                        <label className="font-semibold text-black">Gender</label>
                        <div className="flex gap-6 flex-wrap">
                            <div className="flex gap-2">
                                <input
                                    onChange={handleGenderChange}
                                    checked={employeeData.gender === "Male"}
                                    type="checkbox"
                                    name="gender"
                                    id="Male"
                                    className="w-5"
                                />
                                <span>Male</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    onChange={handleGenderChange}
                                    checked={employeeData.gender === "Female"}
                                    type="checkbox"
                                    name="gender"
                                    id="Female"
                                    className="w-5"
                                />
                                <span>Female</span>
                            </div>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
