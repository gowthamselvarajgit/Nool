package com.nool.backend.monitoring;

import com.nool.backend.repository.auth.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DbKeepAlive {
    private final UserRepository userRepository;

    public DbKeepAlive(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Scheduled(fixedRate = 240000)
    public void keepAlive(){
        try {
            userRepository.count();
            System.out.println("DB keep-alive success");
        } catch (Exception e){
            System.out.println("DB ping failed");
        }
    }
}
