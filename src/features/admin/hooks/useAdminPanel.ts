import { useState, useEffect, useCallback } from "react";
import { fetchUsers, registerUser, BACKEND_ROLES, type UserResponse, type RegisterRequest } from "@/entities/user";

export function useAdminPanel() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<RegisterRequest>({
    username: "",
    password: "",
    fullName: "",
    domain: "",
    role: BACKEND_ROLES.MANAGER,
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error("Не удалось загрузить пользователей", e);
      setError("Не удалось загрузить пользователей");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleRegister = async () => {
    try {
      await registerUser(newUser);
      setIsModalOpen(false);
      setNewUser({ username: "", password: "", fullName: "", domain: "", role: BACKEND_ROLES.MANAGER });
      setSuccess("Пользователь успешно зарегистрирован");
      loadUsers();
    } catch (error) {
      const err = error as { message?: string };
      // Показываем конкретное сообщение об ошибке от валидации
      setError(err.message || "Ошибка при регистрации (возможно логин уже занят)");
    }
  };

  return {
    users,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    newUser,
    setNewUser,
    loadUsers,
    handleRegister,
    error,
    success,
    onError: setError,
    onSuccess: setSuccess,
  };
}