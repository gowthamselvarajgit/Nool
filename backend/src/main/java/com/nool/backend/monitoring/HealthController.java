package com.nool.backend.monitoring;

import com.nool.backend.repository.auth.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {
    private final UserRepository userRepository;
    public HealthController(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @GetMapping
    public String health(){
        userRepository.count();
        return "DB OK";
    }
}
