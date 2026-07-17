// Purpose: Lightweight DI without heavy frameworks. Register services at bootstrap.

using System;
using System.Collections.Generic;
using UnityEngine;

namespace CruzaRD.Core
{
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new();

        public static void Register<T>(T instance) where T : class
        {
            if (instance == null)
                throw new ArgumentNullException(nameof(instance));

            _services[typeof(T)] = instance;
        }

        public static T Get<T>() where T : class
        {
            if (_services.TryGetValue(typeof(T), out var service))
                return (T)service;

            throw new InvalidOperationException($"Service not registered: {typeof(T).Name}");
        }

        public static bool TryGet<T>(out T service) where T : class
        {
            if (_services.TryGetValue(typeof(T), out var obj))
            {
                service = (T)obj;
                return true;
            }

            service = null;
            return false;
        }

        public static void Unregister<T>() where T : class
        {
            _services.Remove(typeof(T));
        }

        public static void Clear()
        {
            _services.Clear();
        }
    }
}
