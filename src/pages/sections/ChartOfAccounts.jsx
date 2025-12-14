"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import Modal from "../../components/Modal";
import {
  getChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
} from "../../api/chartOfAccountApi";
import accountTypeApi from "../../api/accountTypeApi";
import Loader from "./Loader";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAccountTypeForm, setShowAccountTypeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const [formData, setFormData] = useState({
    mainAccountType: "",
    mainTypeCode: "",
    mainAccountTypeText: "",
    financialComponent: "",
    subAccountType: "",
    subAccountCode: "",
    subAccountTypeText: "",
    accountCode: "",
    accountName: "",
  });

  const [accountTypeFormData, setAccountTypeFormData] = useState({
    name: "",
    code: "",
    financialComponent: "",
    description: "",
  });

  const [subAccounts, setSubAccounts] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);

  // Fetch accounts and account types on component mount
  useEffect(() => {
    fetchAccounts();
    fetchAccountTypes();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await getChartOfAccounts();
      setAccounts(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const response = await accountTypeApi.getAll();
      setAccountTypes(response.data);
    } catch (err) {
      console.error("Error fetching account types:", err);
    }
  };

  const handleMainAccountTypeChange = (e) => {
    const selectedTypeId = e.target.value;
    const selectedAccountType = accountTypes.find(
      (type) => type._id === selectedTypeId
    );

    if (selectedAccountType) {
      setFormData({
        ...formData,
        mainAccountType: selectedTypeId,
        mainTypeCode: selectedAccountType.code,
        mainAccountTypeText: selectedAccountType.name,
        financialComponent: selectedAccountType.financialComponent,
      });
    } else {
      setFormData({
        ...formData,
        mainAccountType: selectedTypeId,
        mainTypeCode: "",
        mainAccountTypeText: "",
        financialComponent: "",
      });
    }
  };

  const handleAddSubAccount = () => {
    if (formData.subAccountCode && formData.subAccountTypeText) {
      const newSubAccount = {
        id: Date.now(),
        code: formData.subAccountCode,
        type: formData.subAccountTypeText,
      };
      setSubAccounts([...subAccounts, newSubAccount]);
      setFormData({
        ...formData,
        subAccountCode: "",
        subAccountTypeText: "",
      });
    }
  };

  const handleDeleteSubAccount = (id) => {
    setSubAccounts(subAccounts.filter((acc) => acc.id !== id));
  };

  // const handleAddListAccount = () => {
  //   if (formData.accountCode && formData.accountName) {
  //     const newListAccount = {
  //       id: Date.now(),
  //       code: formData.accountCode,
  //       name: formData.accountName,
  //     };
  //     setListAccounts([...listAccounts, newListAccount]);
  //     setFormData({
  //       ...formData,
  //       accountCode: "",
  //       accountName: "",
  //     });
  //   }
  // };

  // const handleDeleteListAccount = (id) => {
  //   setListAccounts(listAccounts.filter((acc) => acc.id !== id));
  // };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const accountData = {
        mainAccountType: formData.mainAccountType,
        mainTypeCode: formData.mainTypeCode,
        mainAccountTypeText: formData.mainAccountTypeText,
        financialComponent: formData.financialComponent,
        subAccounts: subAccounts,
        listAccounts: listAccounts,
      };

      if (editingAccount) {
        // Update existing account
        await updateChartOfAccount(editingAccount._id, accountData);
      } else {
        // Create new account
        await createChartOfAccount(accountData);
      }

      // Refresh accounts list
      await fetchAccounts();

      // Reset form
      setFormData({
        mainAccountType: "",
        mainTypeCode: "",
        mainAccountTypeText: "",
        financialComponent: "",
        subAccountType: "",
        subAccountCode: "",
        subAccountTypeText: "",
        accountCode: "",
        accountName: "",
      });
      setSubAccounts([]);
      setListAccounts([]);
      setEditingAccount(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("Error saving account:", err);
      setError(err.message || "Failed to save account");
      alert(err.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      mainAccountType: account.mainAccountType,
      mainTypeCode: account.mainTypeCode,
      mainAccountTypeText: account.mainAccountTypeText,
      financialComponent: account.financialComponent,
      subAccountType: "",
      subAccountCode: "",
      subAccountTypeText: "",
      accountCode: "",
      accountName: "",
    });
    setSubAccounts(account.subAccounts || []);
    setListAccounts(account.listAccounts || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteChartOfAccount(id);
      await fetchAccounts();
      setError(null);
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account");
      alert(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountType = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await accountTypeApi.create(accountTypeFormData);
      setAccountTypeFormData({
        name: "",
        code: "",
        financialComponent: "",
        description: "",
      });
      setShowAccountTypeForm(false);
      await fetchAccountTypes();
    } catch (err) {
      console.error("Error creating account type:", err);
      setError(err.message || "Failed to create account type");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingAccount(null);
    setFormData({
      mainAccountType: "",
      mainTypeCode: "",
      mainAccountTypeText: "",
      financialComponent: "",
      subAccountType: "",
      subAccountCode: "",
      subAccountTypeText: "",
      accountCode: "",
      accountName: "",
    });
    setSubAccounts([]);
    setListAccounts([]);
    setError(null);
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Chart of Accounts
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
          disabled={loading}
        >
          <FiPlus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* New Account Type Modal - Higher z-index to appear above other modals */}
      {showAccountTypeForm && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          onClick={() => {
            setShowAccountTypeForm(false);
            setAccountTypeFormData({
              name: "",
              code: "",
              financialComponent: "",
              description: "",
            });
          }}
        >
          {/* Dark overlay background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                Create New Account Type
              </h2>
              <button
                onClick={() => {
                  setShowAccountTypeForm(false);
                  setAccountTypeFormData({
                    name: "",
                    code: "",
                    financialComponent: "",
                    description: "",
                  });
                }}
                className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
                type="button"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleCreateAccountType} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Account Type Name *
                  </label>
                  <input
                    type="text"
                    value={accountTypeFormData.name}
                    onChange={(e) =>
                      setAccountTypeFormData({
                        ...accountTypeFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Administrative Expenses"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={accountTypeFormData.code}
                    onChange={(e) =>
                      setAccountTypeFormData({
                        ...accountTypeFormData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., ADM"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Financial Component *
                  </label>
                  <select
                    value={accountTypeFormData.financialComponent}
                    onChange={(e) =>
                      setAccountTypeFormData({
                        ...accountTypeFormData,
                        financialComponent: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Financial Component</option>
                    <option value="salary">Salary</option>
                    <option value="pay roll">Pay Roll</option>
                    <option value="pr expenses">PR Expenses</option>
                    <option value="miscellaneous expenses">
                      Miscellaneous Expenses
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={accountTypeFormData.description}
                    onChange={(e) =>
                      setAccountTypeFormData({
                        ...accountTypeFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Account Type"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAccountTypeForm(false);
                      setAccountTypeFormData({
                        name: "",
                        code: "",
                        financialComponent: "",
                        description: "",
                      });
                    }}
                    disabled={loading}
                    className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingAccount ? "Edit Account" : "Add New Account"}
        size="5xl"
      >
        <form onSubmit={handleAdd} className="space-y-6">
          {/* =========================== */}
          {/* CREATE NEW ACCOUNT TYPE     */}
          {/* =========================== */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Need a New Account Type?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new main account type before adding accounts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountTypeForm(true)}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Create New Account Type
              </button>
            </div>
          </div>

          {/* =========================== */}
          {/*   MAIN ACCOUNT TYPE SECTION */}
          {/* =========================== */}
          <div className="space-y-3">
            <div className="border-b border-border pb-2">
              <h2 className="font-semibold text-lg text-foreground">
                Main Account Types
              </h2>
            </div>

            <select
              value={formData.mainAccountType}
              onChange={handleMainAccountTypeChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              style={{ accentColor: "#f97316" }}
              required
            >
              <option value="">Select Main Account Type</option>
              {accountTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Main Type Code"
                value={formData.mainTypeCode}
                readOnly
                className="px-4 py-2.5 border border-border rounded-lg bg-muted text-foreground focus:outline-none"
              />

              <input
                type="text"
                placeholder="Main Account Type"
                value={formData.mainAccountTypeText}
                readOnly
                className="px-4 py-2.5 border border-border rounded-lg bg-muted text-foreground focus:outline-none"
              />

              <input
                type="text"
                placeholder="Financial Statements Component"
                value={formData.financialComponent}
                readOnly
                className="px-4 py-2.5 border border-border rounded-lg bg-muted text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* =========================== */}
          {/*      SUB ACCOUNT TYPES      */}
          {/* =========================== */}
          <div className="space-y-3">
            <h2 className="font-semibold text-lg text-foreground border-b border-border pb-2">
              Sub Account Types
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Sub Account Code"
                value={formData.subAccountCode}
                onChange={(e) =>
                  setFormData({ ...formData, subAccountCode: e.target.value })
                }
                className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />

              <input
                type="text"
                placeholder="Sub Account Type"
                value={formData.subAccountTypeText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subAccountTypeText: e.target.value,
                  })
                }
                className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAddSubAccount}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <FiPlus className="w-4 h-4" />
              Add Sub Account
            </button>

            {/* List of Sub Accounts */}
            {subAccounts.length > 0 && (
              <div className="mt-4 border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                        Code
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                        Sub Account Type
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subAccounts.map((subAcc) => (
                      <tr key={subAcc.id} className="hover:bg-muted/50">
                        <td className="px-4 py-2 text-sm text-foreground">
                          {subAcc.code}
                        </td>
                        <td className="px-4 py-2 text-sm text-foreground">
                          {subAcc.type}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubAccount(subAcc.id)}
                            className="p-1 hover:bg-red-100 rounded transition text-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* =========================== */}
          {/*       LIST OF ACCOUNTS      */}
          {/* =========================== */}
          {/* <div className="space-y-3">
            <h2 className="font-semibold text-lg text-foreground border-b border-border pb-2">
              List of Accounts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Account Code"
                value={formData.accountCode}
                onChange={(e) =>
                  setFormData({ ...formData, accountCode: e.target.value })
                }
                className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />

              <input
                type="text"
                placeholder="Account Name"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAddListAccount}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus className="w-4 h-4" />
              Add Account
            </button>

            {listAccounts.length > 0 && (
              <div className="mt-4 border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                        Code
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                        Account Name
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listAccounts.map((listAcc) => (
                      <tr key={listAcc.id} className="hover:bg-muted/50">
                        <td className="px-4 py-2 text-sm text-foreground">
                          {listAcc.code}
                        </td>
                        <td className="px-4 py-2 text-sm text-foreground">
                          {listAcc.name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            type="button"
                            onClick={() => handleDeleteListAccount(listAcc.id)}
                            className="p-1 hover:bg-red-100 rounded transition text-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div> */}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : editingAccount
                ? "Update Account"
                : "Save Account"}
            </button>

            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Main Type Code
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Main Account Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Financial Component
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Sub Accounts
                </th>
                {/* <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Accounts
                </th> */}
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No accounts found. Click "Add Account" to create one.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {account.mainTypeCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {account.mainAccountTypeText}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {account.financialComponent}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {account.subAccounts && account.subAccounts.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {account.subAccounts.map((sub, index) => (
                            <li
                              key={sub._id || sub.id || `${sub.code}-${index}`}
                            >
                              {sub.code} - {sub.type}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground/50">None</span>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-muted-foreground">
                      {account.listAccounts &&
                      account.listAccounts.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {account.listAccounts.map((acc, index) => (
                            <li
                              key={acc._id || acc.id || `${acc.code}-${index}`}
                            >
                              {acc.code} - {acc.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground/50">None</span>
                      )}
                    </td> */}
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        disabled={loading}
                        className="p-2 hover:bg-muted rounded-lg transition text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        disabled={loading}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
